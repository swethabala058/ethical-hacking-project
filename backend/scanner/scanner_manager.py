import time
import datetime
from typing import List, Dict, Any, Callable
from sqlalchemy.orm import Session

from scanner.nmap_scanner import NmapScanner
from scanner.nikto_scanner import NiktoScanner
from scanner.zap_scanner import ZapScanner
from scanner.bandit_scanner import BanditScanner

from database.models import Scan, Finding
from utils.logger import logger

class ScannerManager:
    def __init__(self, db_session: Session, scan_id: int):
        self.db = db_session
        self.scan_id = scan_id
        self.logs_buffer = []

    def log(self, message: str):
        timestamp = datetime.datetime.now().strftime("%H:%M:%S")
        entry = f"[{timestamp}] {message}"
        self.logs_buffer.append(entry)
        logger.info(entry)
        
        # Persist log updates in DB
        scan = self.db.query(Scan).filter(Scan.id == self.scan_id).first()
        if scan:
            scan.logs = "\n".join(self.logs_buffer)
            self.db.commit()

    def execute_scan(self, log_listener: Callable[[str], None] = None) -> Scan:
        scan = self.db.query(Scan).filter(Scan.id == self.scan_id).first()
        if not scan:
            raise ValueError(f"Scan ID {self.scan_id} not found in database.")

        scan.status = "Running"
        scan.progress = 10
        self.db.commit()

        def internal_log(msg: str):
            self.log(msg)
            if log_listener:
                log_listener(msg)

        internal_log(f"Starting Automated Security Scan #{scan.id} for target: {scan.target}")
        scanners_to_run = [s.strip().lower() for s in scan.scanners.split(",") if s.strip()]
        
        all_findings = []
        total_steps = len(scanners_to_run)
        step_increment = 80 // max(total_steps, 1)

        start_time = time.time()

        for idx, scanner_name in enumerate(scanners_to_run):
            internal_log(f"--- Step {idx+1}/{total_steps}: Executing {scanner_name.upper()} scanner ---")
            
            findings = []
            if scanner_name == "nmap":
                nmap = NmapScanner(scan.target)
                findings = nmap.run(log_callback=internal_log)
            elif scanner_name == "nikto":
                nikto = NiktoScanner(scan.target)
                findings = nikto.run(log_callback=internal_log)
            elif scanner_name == "zap" or scanner_name == "owasp zap":
                zap = ZapScanner(scan.target)
                findings = zap.run(log_callback=internal_log)
            elif scanner_name == "bandit":
                bandit = BanditScanner(scan.target)
                findings = bandit.run(log_callback=internal_log)
            else:
                internal_log(f"⚠ Unknown scanner type requested: {scanner_name}")

            all_findings.extend(findings)
            
            # Update progress
            scan.progress = min(10 + (idx + 1) * step_increment, 90)
            self.db.commit()

        # Processing Findings
        internal_log("Aggregating and categorizing security findings...")
        
        critical_c = 0
        high_c = 0
        medium_c = 0
        low_c = 0
        info_c = 0

        for f in all_findings:
            sev = f.get("severity", "Medium").capitalize()
            if sev == "Critical":
                critical_c += 1
            elif sev == "High":
                high_c += 1
            elif sev == "Medium":
                medium_c += 1
            elif sev == "Low":
                low_c += 1
            else:
                info_c += 1

            finding_obj = Finding(
                scan_id=scan.id,
                scanner=f.get("scanner", "Scanner"),
                title=f.get("title", "Security Finding"),
                severity=sev,
                description=f.get("description", ""),
                solution=f.get("solution", ""),
                url=f.get("url", scan.target),
                port=f.get("port", 0),
                status="Open"
            )
            self.db.add(finding_obj)

        end_time = time.time()
        duration = int(end_time - start_time)

        scan.status = "Completed"
        scan.progress = 100
        scan.end_time = datetime.datetime.utcnow()
        scan.duration_seconds = max(duration, 2)
        scan.total_findings = len(all_findings)
        scan.critical_count = critical_c
        scan.high_count = high_c
        scan.medium_count = medium_c
        scan.low_count = low_c
        scan.info_count = info_c

        self.db.commit()
        self.db.refresh(scan)

        internal_log(f"Scan #{scan.id} completed in {scan.duration_seconds}s. Total Findings: {scan.total_findings} (Critical: {critical_c}, High: {high_c}, Medium: {medium_c}, Low: {low_c}).")
        return scan
