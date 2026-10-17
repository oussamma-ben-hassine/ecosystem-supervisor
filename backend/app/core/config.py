import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Ecosystem Supervisor"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "production")

    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql+asyncpg://supervisor_user:supervisor_secret_pass_2026@postgres:5432/supervisor_db",
    )
    # Sync database URL for sync operations/migrations if needed
    DATABASE_URL_SYNC: str = os.getenv(
        "DATABASE_URL_SYNC",
        "postgresql://supervisor_user:supervisor_secret_pass_2026@postgres:5432/supervisor_db",
    )

    # Redis
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://redis:6379/0")
    REDIS_STREAM_KEY: str = "events:stream"
    REDIS_CONSUMER_GROUP: str = "supervisor-workers"

    # Security & Auth
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-supervisor-key-2026-production-secure")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # SSO Integration
    SSO_ISSUER: str = os.getenv("SSO_ISSUER", "https://sso-a.oussamma.tn")
    SSO_CLIENT_ID: str = os.getenv("SSO_CLIENT_ID", "ecosystem-supervisor")
    SSO_CLIENT_SECRET: str = os.getenv("SSO_CLIENT_SECRET", "sso_supervisor_secret_2026")
    SSO_REDIRECT_URI: str = os.getenv(
        "SSO_REDIRECT_URI", "https://supervisor.oussamma.tn/api/v1/auth/sso/callback"
    )

    # LiteLLM Integration
    LITELLM_BASE_URL: str = os.getenv("LITELLM_BASE_URL", "https://ai.oussamma.tn")
    LITELLM_API_KEY: str = os.getenv("LITELLM_API_KEY", "sk-oussamma-master-gateway-2026")
    LITELLM_DEFAULT_MODEL: str = os.getenv("LITELLM_DEFAULT_MODEL", "gemini-1.5-flash")

    # CORS
    CORS_ORIGINS: List[str] = [
        "https://supervisor.oussamma.tn",
        "https://oussamma.tn",
        "https://sso-a.oussamma.tn",
        "https://drive.oussamma.tn",
        "https://messenger.oussamma.tn",
        "https://cv.oussamma.tn",
        "https://recettes.oussamma.tn",
        "https://notes.oussamma.tn",
        "https://devspace.oussamma.tn",
        "http://localhost:3000",
        "http://localhost:8000",
        "http://localhost:5173",
        "*",
    ]

    # Authorized Admins
    ADMIN_EMAILS: List[str] = ["oussammabenhassine@gmail.com"]

    model_config = SettingsConfigDict(case_sensitive=True, env_file=".env", extra="ignore")


settings = Settings()
