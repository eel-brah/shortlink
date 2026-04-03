from pydantic import Field, PostgresDsn, RedisDsn, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", case_sensitive=True
    )

    APP_NAME: str = "ShortLink"
    DEBUG: bool = True

    DATABASE_URL: PostgresDsn = Field(repr=False)
    REDIS_URL: RedisDsn = Field(repr=False)

    HASHIDS_SALT: SecretStr

    # SECRET_KEY: str
    # ALGORITHM: str = "HS256"
    # ACCESS_TOKEN_EXPIRE_MINUTES: int = 60


settings = Settings()
