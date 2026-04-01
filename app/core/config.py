from pydantic import  PostgresDsn
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "URL Shortener"
    DEBUG: bool = True

    DATABASE_URL: str
    HASHIDS_SALT: str

    # REDIS_URL: str = "redis://localhost:6379"

    # SECRET_KEY: str
    # ALGORITHM: str = "HS256"
    # ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
