from fastapi import APIRouter, Depends, Request
from fastapi.security import OAuth2PasswordRequestForm
from jose import jwt
from pydantic import SecretStr
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.status import HTTP_201_CREATED
from app.api.deps import get_current_user, get_db
from app.core.config import settings
from app.core.exceptions.base import UnauthorizedError
from app.core.token import (
    blacklist_refresh_token,
    create_access_token,
    create_refresh_token,
    is_refresh_token_blacklisted,
)
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, UserResponse
from app.services.auth_service import (
    register_user,
    authenticate_user,
)

router = APIRouter()


@router.post("/register", response_model=UserResponse, status_code=HTTP_201_CREATED)
async def register(data: UserCreate, db: AsyncSession = Depends(get_db)):
    return await register_user(db, data)


@router.post("/login", response_model=dict)
async def login(
    request: Request,
    db: AsyncSession = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends(),
):
    data = None

    if request.headers.get("content-type", "").startswith("application/json"):
        body = await request.json()
        data = UserLogin(**body)

    else:
        data = UserLogin(
            username=form_data.username,
            password=SecretStr(form_data.password),
        )

    user = await authenticate_user(db, data)

    payload = {"sub": str(user.id)}

    return {
        "access_token": create_access_token(payload),
        "refresh_token": create_refresh_token(payload),
        "token_type": "bearer",
    }


# @router.post("/login")
# async def login(data: UserLogin, db: AsyncSession = Depends(get_db)):
#     user = await authenticate_user(db, data)
#
#     payload = {"sub": str(user.id)}
#     return {
#         "access_token": create_access_token(payload),
#         "refresh_token": create_refresh_token(payload),
#         "token_type": "bearer",
#     }


@router.post("/refresh", response_model=dict)
async def refresh_token(refresh_token: str, db: AsyncSession = Depends(get_db)):
    try:
        payload = jwt.decode(
            refresh_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        if payload.get("type") != "refresh":
            raise UnauthorizedError("Invalid token type")
        jti = payload.get("jti")
        user_id = payload.get("sub")
        if jti is None or user_id is None:
            raise UnauthorizedError("Invalid refresh token")
    except Exception:
        raise UnauthorizedError("Invalid refresh token")

    if await is_refresh_token_blacklisted(jti):
        raise UnauthorizedError("Refresh token revoked")

    new_access = create_access_token({"sub": str(user_id)})
    new_refresh = create_refresh_token({"sub": str(user_id)})

    await blacklist_refresh_token(jti, int(settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400))

    return {
        "access_token": new_access,
        "refresh_token": new_refresh,
        "token_type": "bearer",
    }


@router.post("/logout")
async def logout(
    refresh_token: str,
    current_user: User = Depends(get_current_user),
):
    try:
        payload = jwt.decode(
            refresh_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        jti = payload.get("jti")
        if jti is None:
            raise UnauthorizedError("Invalid refresh token")
        await blacklist_refresh_token(
            jti, int(settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400)
        )
    except Exception:
        pass

    return {"message": "Logged out successfully"}
