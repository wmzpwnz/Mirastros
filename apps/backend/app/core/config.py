from pydantic_settings import BaseSettings
from pydantic import Field, field_validator, model_validator
from functools import lru_cache
from typing import List, Union
import json

class Settings(BaseSettings):
    # App
    APP_NAME: str = "Mirastros API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    FRONTEND_URL: str = "http://localhost:4200"

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://mirastros:mirastros@localhost:5432/mirastros"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_CACHE_TTL: int = 3600  # 1 hour

    # AI Model - DeepSeek API
    DEEPSEEK_API_KEY: str = Field(default="")
    DEEPSEEK_API_URL: str = "https://api.deepseek.com/v1/chat/completions"
    DEEPSEEK_MODEL: str = "deepseek-flash"
    WELCOME_AI_ENABLED: bool = True
    WELCOME_AI_MAX_ATTEMPTS: int = Field(default=3, ge=1, le=10)
    WELCOME_AI_DAILY_LIMIT: int = Field(default=100, ge=1, le=1000)
    AI_RESULT_EXPLANATIONS_ONLY: bool = True
    LEGACY_AI_CHAT_ENABLED: bool = False
    AI_EXPLANATION_DAILY_LIMIT: int = Field(default=5, ge=1, le=20)
    AI_EXPLANATION_TRIAL_CREDITS: int = Field(default=0, ge=0, le=10)
    EMBEDDING_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"

    # Legacy Ollama (deprecated, kept for backward compatibility)
    OLLAMA_URL: str = "http://localhost:11434"
    MODEL_NAME: str = "mirastros-ai"
    MODEL_PATH: str = "/home/mirastros/models/qwen2.5-7b-instruct.gguf"

    # RAG
    CHUNK_SIZE: int = 512
    CHUNK_OVERLAP: int = 50
    TOP_K_RESULTS: int = 5

    # Security
    CORS_ORIGINS: Union[str, List[str]] = ["http://localhost:3000", "http://localhost:4200", "http://localhost:3001"]
    RATE_LIMIT_PER_MINUTE: int = 60

    @field_validator('CORS_ORIGINS', mode='before')
    @classmethod
    def parse_cors_origins(cls, v):
        """Parse CORS_ORIGINS from string or list"""
        if isinstance(v, str):
            # Try to parse as JSON array first
            try:
                return json.loads(v)
            except (json.JSONDecodeError, ValueError):
                # Fallback: split by comma
                origins = [origin.strip() for origin in v.split(',') if origin.strip()]
                return origins if origins else ["http://localhost:3000", "http://localhost:4200", "http://localhost:3001"]
        return v if isinstance(v, list) else ["http://localhost:3000", "http://localhost:4200", "http://localhost:3001"]

    # JWT
    SECRET_KEY: str = ""
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Monitoring
    SENTRY_DSN: str = ""
    ENVIRONMENT: str = "development"  # development, staging, production

    # Admin
    ADMIN_EMAILS: Union[str, List[str]] = ["admin@mirastros.com"]

    @field_validator('ADMIN_EMAILS', mode='before')
    @classmethod
    def parse_admin_emails(cls, v):
        """Parse ADMIN_EMAILS from string or list"""
        if isinstance(v, str):
            # Try to parse as JSON array first
            try:
                return json.loads(v)
            except (json.JSONDecodeError, ValueError):
                # Fallback: split by comma
                emails = [email.strip() for email in v.split(',') if email.strip()]
                return emails if emails else ["admin@mirastros.com"]
        return v if isinstance(v, list) else ["admin@mirastros.com"]

    # Email: credentials are supplied through the runtime environment.
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM_EMAIL: str = "noreply@mirastros.com"
    SMTP_USE_TLS: bool = True
    SENDGRID_API_KEY: str = ""

    # Payment Gateways
    # YooKassa (ЮKassa) for Russian market
    YOOKASSA_SHOP_ID: str = ""
    YOOKASSA_SECRET_KEY: str = ""

    # Stripe for international market
    STRIPE_SECRET_KEY: str = ""
    STRIPE_PUBLISHABLE_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""

    # External Analytics
    MIXPANEL_TOKEN: str = ""
    AMPLITUDE_API_KEY: str = ""

    @model_validator(mode='after')
    def validate_required_fields(self):
        """Validate that required fields are set"""
        placeholder_secrets = {
            "your-secret-key-change-in-production-min-32-chars",
            "change-me",
            "secret",
        }
        if not self.SECRET_KEY or self.SECRET_KEY in placeholder_secrets or len(self.SECRET_KEY) < 32:
            raise ValueError("SECRET_KEY must be set to a stable value with at least 32 characters")
        if self.ENVIRONMENT == "production" and self.DEBUG:
            raise ValueError("DEBUG must be false in production")
        # DEEPSEEK_API_KEY optional for local dev (AI features will be disabled without it)
        return self

    class Config:
        env_file = ".env"
        case_sensitive = True

@lru_cache()
def get_settings() -> Settings:
    return Settings()
