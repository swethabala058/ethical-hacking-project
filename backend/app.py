import os
import asyncio
import json
from typing import List, Optional
from datetime import datetime

from fastapi import FastAPI, Depends, HTTPException, status, BackgroundTasks, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, FileResponse, StreamingResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import jwt

from config import settings
from database.database import get_db, init_db
from database.models import User, Scan, Finding
from scanner.scanner_manager import ScannerManager
from utils.validator import validate_target
from reports.report_generator import ReportGenerator

# Initialize DB tables
init_db()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_PREFIX}/openapi.json"
)

# Enable CORS for React frontend (Vite default port 5173 or any port)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Pydantic Schemas
class UserRegisterSchema(BaseModel):
    name: str
    email: str
    password: str

class UserLoginSchema(BaseModel):
    email: str
    password: str

class ScanCreateSchema(BaseModel):
    target: str
    scanners: List[str]  # e.g. ["nmap", "nikto", "zap", "bandit"]
    authorized: bool

# Auth Helpers
def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    token = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return token

# --- Endpoints ---

@app.get("/health")
def health_check():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "timestamp": datetime.utcnow().isoformat()
    }

@app.post(f"{settings.API_PREFIX}/auth/register")
def register_user(user_in: UserRegisterSchema, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered.")
    
    hashed = get_password_hash(user_in.password)
    user = User(name=user_in.name, email=user_in.email, hashed_password=hashed)
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": user.email, "id": user.id})
    return {"token": token, "user": {"id": user.id, "name": user.name, "email": user.email}}

@app.post(f"{settings.API_PREFIX}/auth/login")
def login_user(user_in: UserLoginSchema, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_in.email).first()
    if not user or not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    token = create_access_token({"sub": user.email, "id": user.id})
    return {"token": token, "user": {"id": user.id, "name": user.name, "email": user.email}}

@app.post(f"{settings.API_PREFIX}/scans")
def create_scan(scan_in: ScanCreateSchema, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    if not scan_in.authorized:
        raise HTTPException(status_code=403, detail="Explicit authorization required before scanning target.")

    # Target Validation
    is_bandit_only = len(scan_in.scanners) == 1 and scan_in.scanners[0].lower() == "bandit"
    scan_type = "bandit" if is_bandit_only else "web"
    is_valid, cleaned_target, msg = validate_target(scan_in.target, scan_type=scan_type)
    
    if not is_valid:
        raise HTTPException(status_code=400, detail=msg)

    scanners_str = ",".join([s.strip().lower() for s in scan_in.scanners if s.strip()])
    if not scanners_str:
        raise HTTPException(status_code=400, detail="At least one scanner must be selected.")

    scan = Scan(
        target=cleaned_target,
        scanners=scanners_str,
        status="Pending",
        progress=0
    )
    db.add(scan)
    db.commit()
    db.refresh(scan)

    # Launch background scan execution
    def run_scan_task(scan_id: int):
        db_sess = next(get_db())
        try:
            manager = ScannerManager(db_sess, scan_id)
            manager.execute_scan()
        finally:
            db_sess.close()

    background_tasks.add_task(run_scan_task, scan.id)

    return {
        "id": scan.id,
        "target": scan.target,
        "scanners": scan.scanners,
        "status": scan.status,
        "message": "Security scan initialized successfully."
    }

@app.get(f"{settings.API_PREFIX}/scans")
def list_scans(db: Session = Depends(get_db)):
    scans = db.query(Scan).order_by(Scan.id.desc()).all()
    res = []
    for s in scans:
        res.append({
            "id": s.id,
            "target": s.target,
            "scanners": s.scanners,
            "status": s.status,
            "progress": s.progress,
            "start_time": s.start_time.isoformat() if s.start_time else None,
            "duration_seconds": s.duration_seconds,
            "total_findings": s.total_findings,
            "critical_count": s.critical_count,
            "high_count": s.high_count,
            "medium_count": s.medium_count,
            "low_count": s.low_count,
            "info_count": s.info_count
        })
    return res

@app.get(f"{settings.API_PREFIX}/scans/{{scan_id}}")
def get_scan(scan_id: int, db: Session = Depends(get_db)):
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found.")
    
    return {
        "id": scan.id,
        "target": scan.target,
        "scanners": scan.scanners,
        "status": scan.status,
        "progress": scan.progress,
        "start_time": scan.start_time.isoformat() if scan.start_time else None,
        "end_time": scan.end_time.isoformat() if scan.end_time else None,
        "duration_seconds": scan.duration_seconds,
        "total_findings": scan.total_findings,
        "critical_count": scan.critical_count,
        "high_count": scan.high_count,
        "medium_count": scan.medium_count,
        "low_count": scan.low_count,
        "info_count": scan.info_count,
        "logs": scan.logs or ""
    }

@app.get(f"{settings.API_PREFIX}/scans/{{scan_id}}/results")
def get_scan_results(scan_id: int, db: Session = Depends(get_db)):
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found.")

    findings = db.query(Finding).filter(Finding.scan_id == scan_id).all()
    res_findings = []
    for f in findings:
        res_findings.append({
            "id": f.id,
            "scan_id": f.scan_id,
            "scanner": f.scanner,
            "title": f.title,
            "severity": f.severity,
            "description": f.description,
            "solution": f.solution,
            "url": f.url,
            "port": f.port,
            "status": f.status,
            "timestamp": f.timestamp.isoformat() if f.timestamp else None
        })
    return {
        "scan": {
            "id": scan.id,
            "target": scan.target,
            "status": scan.status,
            "duration_seconds": scan.duration_seconds,
            "critical_count": scan.critical_count,
            "high_count": scan.high_count,
            "medium_count": scan.medium_count,
            "low_count": scan.low_count,
            "info_count": scan.info_count
        },
        "findings": res_findings
    }

@app.get(f"{settings.API_PREFIX}/scans/{{scan_id}}/stream")
async def stream_scan_progress(scan_id: int, db: Session = Depends(get_db)):
    """Server-Sent Events (SSE) endpoint for real-time progress and log streaming."""
    async def event_generator():
        while True:
            db_sess = next(get_db())
            try:
                scan = db_sess.query(Scan).filter(Scan.id == scan_id).first()
                if not scan:
                    yield f"data: {json.dumps({'error': 'Scan not found'})}\n\n"
                    break

                payload = {
                    "id": scan.id,
                    "status": scan.status,
                    "progress": scan.progress,
                    "logs": scan.logs or "",
                    "total_findings": scan.total_findings
                }
                yield f"data: {json.dumps(payload)}\n\n"

                if scan.status in ["Completed", "Failed"]:
                    break
            finally:
                db_sess.close()

            await asyncio.sleep(1.5)

    return StreamingResponse(event_generator(), media_type="text/event-stream")

@app.delete(f"{settings.API_PREFIX}/scans/{{scan_id}}")
def delete_scan(scan_id: int, db: Session = Depends(get_db)):
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found.")

    db.delete(scan)
    db.commit()
    return {"message": f"Scan #{scan_id} deleted successfully."}

@app.get(f"{settings.API_PREFIX}/reports/{{scan_id}}/html")
def view_html_report(scan_id: int, db: Session = Depends(get_db)):
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found.")

    gen = ReportGenerator(scan)
    html_content = gen.generate_html()
    return HTMLResponse(content=html_content)

@app.get(f"{settings.API_PREFIX}/reports/{{scan_id}}/pdf")
def download_pdf_report(scan_id: int, db: Session = Depends(get_db)):
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found.")

    gen = ReportGenerator(scan)
    pdf_path = gen.generate_pdf()
    return FileResponse(
        pdf_path,
        media_type="application/pdf",
        filename=f"Security_Report_Scan_{scan_id}.pdf"
    )

@app.get(f"{settings.API_PREFIX}/stats/dashboard")
def get_dashboard_stats(db: Session = Depends(get_db)):
    scans = db.query(Scan).all()
    total_scans = len(scans)
    
    findings = db.query(Finding).all()
    total_findings = len(findings)
    critical_issues = sum(1 for f in findings if f.severity == "Critical")
    high_issues = sum(1 for f in findings if f.severity == "High")
    medium_issues = sum(1 for f in findings if f.severity == "Medium")
    low_issues = sum(1 for f in findings if f.severity == "Low")
    info_issues = sum(1 for f in findings if f.severity == "Informational")
    
    open_ports_count = sum(1 for f in findings if f.port > 0)

    # Dynamic Activity by day calculation
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    day_counts = {d: 0 for d in days}
    for s in scans:
        if s.start_time:
            day_name = s.start_time.strftime("%a")
            if day_name in day_counts:
                day_counts[day_name] += 1

    activity_7d = [{"day": d, "scans": day_counts[d]} for d in days]

    return {
        "total_scans": total_scans,
        "total_findings": total_findings,
        "critical_issues": critical_issues,
        "high_issues": high_issues,
        "medium_issues": medium_issues,
        "low_issues": low_issues,
        "info_issues": info_issues,
        "open_ports": open_ports_count,
        "scan_activity_7d": activity_7d,
        "recent_scans": [
            {
                "id": s.id,
                "target": s.target,
                "scanners": s.scanners,
                "status": s.status,
                "start_time": s.start_time.isoformat() if s.start_time else None,
                "total_findings": s.total_findings
            } for s in sorted(scans, key=lambda x: x.id, reverse=True)[:5]
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)
