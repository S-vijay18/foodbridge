import os
from pydantic import BaseModel

class Settings(BaseModel):
    APP_NAME: str = "FoodBridge"
    APP_ENV: str = os.getenv("APP_ENV", "development")
    API_V1_PREFIX: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-foodbridge-jwt-token-key-2026-prod-grade")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./foodbridge.db")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    CORS_ORIGINS: list[str] = ["*"]

settings = Settings()

