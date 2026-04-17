from fastapi import APIRouter, Depends, File, Request, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.status import HTTP_204_NO_CONTENT
from app.api.deps import get_current_user, get_db
from app.core.exceptions.base import NotFoundError
from app.core.logger import get_logger
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate
from app.services.user_service import (
    delete_avatar_service,
    delete_user,
    get_user,
    update_user,
    upload_avatar_service,
)
from app.core.limiter import limiter

logger = get_logger(__name__)
router = APIRouter()


@router.get("/me", response_model=UserResponse)
@limiter.limit("40/minute")
async def get_user_info(
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user = await get_user(db, current_user.id)
    if not user:
        raise NotFoundError("User not found")
    logger.info(
        "Get user info",
        user_id=current_user.id,
        username=user.username,
        email=user.email,
    )
    return user


@router.put("/me", response_model=UserResponse)
@limiter.limit("5/minute")
async def update_my_profile(
    request: Request,
    data: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    updated_user = await update_user(db, current_user.id, data)
    logger.info(
        "User profile updated successfully",
        user_id=current_user.id,
        username=updated_user.username,
        email=updated_user.email,
        updated_fields=[
            field for field in ["username", "email", "password"] if getattr(data, field) is not None
        ],
    )
    return updated_user


@router.delete("/me", status_code=HTTP_204_NO_CONTENT)
@limiter.limit("5/minute")
async def delete_my_account(
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await delete_user(db, current_user.id)
    logger.info(
        "User account deleted successfully",
        user_id=current_user.id,
        username=current_user.username,
        email=current_user.email,
    )
    return None


@router.post("/me/avatar")
@limiter.limit("5/minute")
async def upload_avatar(
    request: Request,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await upload_avatar_service(file, current_user.id, db)

    logger.info(
        "User avatar uploaded successfully",
        user_id=current_user.id,
        username=current_user.username,
        email=current_user.email,
    )
    return {
        "message": "Avatar uploaded successfully",
        "avatar_url": current_user.avatar_url,
    }


@router.delete("/me/avatar", status_code=HTTP_204_NO_CONTENT)
@limiter.limit("5/minute")
async def delete_avatar(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):

    if await delete_avatar_service(current_user.id, db):
        logger.info(
            "User avatar deleted successfully",
            user_id=current_user.id,
            username=current_user.username,
            email=current_user.email,
        )
    else:
        logger.warning(
            "Avatar reference cleared, but file deletion failed.",
        )
