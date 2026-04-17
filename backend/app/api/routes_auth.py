from fastapi import APIRouter, Depends, Request, Response
from fastapi.security import OAuth2PasswordRequestForm
from jose import jwt
from pydantic import SecretStr
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.status import HTTP_201_CREATED
from app.api.deps import get_db
from app.core.limiter import limiter
from app.core.config import settings
from app.core.exceptions.base import UnauthorizedError
from app.core.logger import get_logger
from app.core.token import (
    blacklist_refresh_token,
    create_access_token,
    create_refresh_token,
    is_refresh_token_blacklisted,
)
from app.schemas.url import RefreshTokenRequest
from app.schemas.user import UserCreate, UserLogin, UserResponse
from app.services.auth_service import (
    register_user,
    authenticate_user,
)

logger = get_logger(__name__)
router = APIRouter()


@router.post("/register", response_model=UserResponse, status_code=HTTP_201_CREATED)
@limiter.limit("5/minute")
async def register(
    request: Request, data: UserCreate, db: AsyncSession = Depends(get_db)
):
    user = await register_user(db, data)
    logger.info(
        "User registered successfully",
        user_id=user.id,
        username=user.username,
        email=user.email,
    )
    return user


@router.post("/login", response_model=dict)
@limiter.limit("10/minute")
async def login(
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends(),
):
    data = None

    if request.headers.get("content-type", "").startswith("application/json"):
        body = await request.json()
        data = UserLogin(**body)

    else:
        data = UserLogin(
            username=form_data.username if "@" not in form_data.username else None,
            email=form_data.username if "@" in form_data.username else None,
            password=SecretStr(form_data.password),
        )

    user = await authenticate_user(db, data)

    payload = {"sub": str(user.id)}

    access_token = create_access_token(payload)
    refresh_token = create_refresh_token(payload)

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=not settings.DEBUG,
        samesite=settings.COOKIE_SAMESITE,
        path="/",
    )

    logger.info(
        "User logged in successfully",
        user_id=user.id,
        username=user.username,
        email=user.email,
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }


# @router.post("/login")
# async def login(data: UserLogin, db: AsyncSession = Depends(get_db)):
#     user = await authenticate_user(db, data)
#
#     payload = {"sub": str(user.id)}
#     access_token = create_access_token(payload)
#     refresh_token = create_refresh_token(payload)
#
#     logger.info(
#         "User logged in successfully",
#         user_id=user.id,
#         username=user.username,
#         email=user.email,
#     )
#     return {
#         "access_token": access_token,
#         "refresh_token": refresh_token,
#         "token_type": "bearer",
#     }
#


@router.post("/refresh", response_model=dict)
@limiter.limit("10/minute")
async def refresh_token(
    request: Request, response: Response, db: AsyncSession = Depends(get_db)
):
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise UnauthorizedError("Missing refresh token")

    data = RefreshTokenRequest(refresh_token=refresh_token)
    refresh_token = data.refresh_token

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

    response.set_cookie(
        key="refresh_token",
        value=new_refresh,
        httponly=True,
        secure=False,
        samesite="lax",
        path="/",
        max_age=int(settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400),
    )

    logger.info("Tokens created successfully")

    return {
        "access_token": new_access,
    }


@router.post("/logout")
@limiter.limit("10/minute")
async def logout(
    response: Response,
    request: Request,
):
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        return {"message": "Already logged out"}

    data = RefreshTokenRequest(refresh_token=refresh_token)
    payload = jwt.decode(
        data.refresh_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
    )
    jti = payload.get("jti")
    if jti is None or payload.get("type") != "refresh":
        raise UnauthorizedError("Invalid refresh token")
    await blacklist_refresh_token(jti, int(settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400))

    response.delete_cookie("refresh_token")

    user_id = payload.get("sub")
    if user_id is None:
        raise UnauthorizedError()

    logger.info("User logged out successfully", user_id=user_id)

    return {"message": "Logged out successfully"}
