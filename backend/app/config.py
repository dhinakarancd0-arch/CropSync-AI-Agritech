from pydantic_settings import BaseSettings
from typing import Optional
import os


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "AgriDirect"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    # Database
    DATABASE_URL: str = "sqlite:///./agridirect.db"
    
    # JWT
    SECRET_KEY: str = "agridirect-secret-key-change-in-production-2024"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours for demo
    
    # CORS
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"
    
    # Gemini API (optional)
    GEMINI_API_KEY: Optional[str] = None
    
    # Demo
    DEMO_PASSWORD: str = "AgriDirect2024!"
    
    class Config:
        env_file = ".env"
        extra = "allow"


settings = Settings()
