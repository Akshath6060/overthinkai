from functools import lru_cache
from typing import Literal

from pydantic import Field, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_env: Literal["development", "test", "production"] = "development"
    app_name: str = "Overthinker AI"
    mongodb_uri: str = ""
    mongodb_database: str = "overthinker"
    openai_api_key: str = ""
    openai_model: str = "gpt-4.1-mini"
    openai_judge_model: str = "gpt-4.1-mini"
    session_secret: str = "development-only-change-me-please-32-chars"
    session_expire_days: int = Field(default=30, ge=1, le=365)
    frontend_url: str = "http://localhost:5173"
    allowed_origins: str = "http://localhost:5173"
    default_credit_allowance: int = Field(default=1000, ge=0)
    ai_provider: Literal["openai", "mock"] = "mock"
    log_level: str = "INFO"
    cookie_secure: bool = False
    cookie_samesite: Literal["lax", "strict", "none"] = "lax"
    docs_enabled: bool = True
    rate_limit_enabled: bool = True

    @property
    def cors_origins(self) -> list[str]:
        values = [self.frontend_url, *self.allowed_origins.split(",")]
        return list(dict.fromkeys(v.strip().rstrip("/") for v in values if v.strip()))

    @model_validator(mode="after")
    def production_safety(self):
        if self.app_env == "production":
            if len(self.session_secret) < 32 or "development" in self.session_secret:
                raise ValueError("SESSION_SECRET must be a strong secret in production")
            if not self.mongodb_uri or self.mongodb_uri.startswith("memory://"):
                raise ValueError("MONGODB_URI is required in production")
            if self.ai_provider == "mock":
                raise ValueError("AI_PROVIDER=mock is not allowed in production")
            if self.cookie_samesite == "none" and not self.cookie_secure:
                raise ValueError("SameSite=None cookies require COOKIE_SECURE=true")
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()

