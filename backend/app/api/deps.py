from fastapi import Depends, Request
from jose import JWTError, jwt
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.core.exceptions.base import UnauthorizedError
from app.db.session import AsyncSessionLocal
from fastapi.security import OAuth2PasswordBearer

from app.models.user import User
from app.services.user_service import get_user


async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login", auto_error=False)


async def get_current_user_by_token(
    db: AsyncSession,
    token: str,
) -> User:
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        if payload.get("type") != "access":
            raise UnauthorizedError()
        user_id = payload.get("sub")
        if user_id is None:
            raise UnauthorizedError()
        # jti = payload.get("jti")
        # check access token blacklist
    except (JWTError, ValueError, TypeError):
        raise UnauthorizedError("Could not validate credentials")

    user = await get_user(db, int(user_id))
    if not user:
        raise UnauthorizedError("User no longer exists")

    return user


async def get_current_user_optional(
    db: AsyncSession = Depends(get_db), token: str = Depends(oauth2_scheme)
) -> User | None:
    if not token:
        return None

    return await get_current_user_by_token(db, token)


async def get_current_user(
    db: AsyncSession = Depends(get_db),
    token: str = Depends(oauth2_scheme),
) -> User:
    if not token:
        raise UnauthorizedError("Not authenticated")

    return await get_current_user_by_token(db, token)


def get_user_id_from_request(request: Request) -> str | None:
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None

    token = auth_header.split(" ")[1]

    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        return payload.get("sub")
    except (JWTError, ValueError):
        return None
