from datetime import timedelta
from typing import Any

from jose import jwt
import uuid
from app.core.redis import redis
from app.core.config import settings
from app.utils.utils import date_now

# try:
#     decoded_payload = jwt.decode(token, secret_key, algorithms=['HS256'])
# except


def create_access_token(
    data: dict[str, Any], expires_delta: timedelta | None = None
) -> str:
    to_encode = data.copy()

    expire = date_now() + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    to_encode.update(
        {
            "exp": expire,
            "iat": date_now(),
            "type": "access",
            "iss": settings.APP_NAME,
            "jti": str(uuid.uuid4()),
        }
    )

    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_refresh_token(
    data: dict[str, Any], expires_delta: timedelta | None = None
) -> str:
    to_encode = data.copy()

    expire = date_now() + (
        expires_delta or timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    )

    to_encode.update(
        {
            "exp": expire,
            "iat": date_now(),
            "type": "refresh",
            "iss": settings.APP_NAME,
            "jti": str(uuid.uuid4()),
        }
    )

    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


async def blacklist_refresh_token(jti: str, expires_in: int):
    await redis.setex(f"blacklist:refresh:{jti}", expires_in, "1")


async def is_refresh_token_blacklisted(jti: str) -> bool:
    return bool(await redis.exists(f"blacklist:refresh:{jti}"))
