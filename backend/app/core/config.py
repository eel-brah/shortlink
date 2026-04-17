from typing import Literal
from pydantic import Field, PostgresDsn, RedisDsn, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", case_sensitive=True
    )

    APP_NAME: str = "ShortLink"
    DEBUG: bool = True

    ALLOWED_ORIGINS: list[str] 
    COOKIE_SAMESITE: Literal["lax", "none", "strict"] = "lax"

    DATABASE_URL: PostgresDsn = Field(repr=False)
    REDIS_URL: RedisDsn = Field(repr=False)
    REDIS_TIMEOUT: float = 1.0

    HASHIDS_SALT: SecretStr

    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7


settings = Settings()
