import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Automated Security Scanner"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    
    # Secret Key for JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY", "cyber_sec_super_secret_key_2026_antigravity_soc")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./security_scanner.db")
    
    # Scanner Timeouts (seconds)
    NMAP_TIMEOUT: int = 300
    NIKTO_TIMEOUT: int = 300
    ZAP_TIMEOUT: int = 600
    BANDIT_TIMEOUT: int = 180
    
    # Reports output directory
    REPORTS_DIR: str = os.path.join(os.path.dirname(os.path.abspath(__file__)), "generated_reports")

    class Config:
        case_sensitive = True

settings = Settings()

os.makedirs(settings.REPORTS_DIR, exist_ok=True)
