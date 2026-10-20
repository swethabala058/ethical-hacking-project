import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from database.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Scan(Base):
    __tablename__ = "scans"

    id = Column(Integer, primary_key=True, index=True)
    target = Column(String(255), nullable=False)
    scanners = Column(String(255), nullable=False)  # Comma separated scanners
    status = Column(String(50), default="Pending") # Pending, Running, Completed, Failed
    progress = Column(Integer, default=0)           # 0 to 100
    start_time = Column(DateTime, default=datetime.datetime.utcnow)
    end_time = Column(DateTime, nullable=True)
    duration_seconds = Column(Integer, default=0)
    total_findings = Column(Integer, default=0)
    critical_count = Column(Integer, default=0)
    high_count = Column(Integer, default=0)
    medium_count = Column(Integer, default=0)
    low_count = Column(Integer, default=0)
    info_count = Column(Integer, default=0)
    logs = Column(Text, default="")
    
    findings = relationship("Finding", back_populates="scan", cascade="all, delete-orphan")

class Finding(Base):
    __tablename__ = "findings"

    id = Column(Integer, primary_key=True, index=True)
    scan_id = Column(Integer, ForeignKey("scans.id", ondelete="CASCADE"), nullable=False)
    scanner = Column(String(50), nullable=False)
    title = Column(String(255), nullable=False)
    severity = Column(String(50), nullable=False) # Critical, High, Medium, Low, Informational
    description = Column(Text, nullable=True)
    solution = Column(Text, nullable=True)
    url = Column(String(500), nullable=True)
    port = Column(Integer, default=0)
    evidence = Column(Text, nullable=True)
    status = Column(String(50), default="Open") # Open, Resolved, Ignored
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    scan = relationship("Scan", back_populates="findings")
