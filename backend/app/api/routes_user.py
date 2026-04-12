from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.status import HTTP_204_NO_CONTENT
from app.api.deps import get_current_user, get_db
from app.core.logger import get_logger
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate
from app.services.user_service import (
    delete_user,
    update_user,
)

logger = get_logger(__name__)
router = APIRouter()


@router.put("/me", response_model=UserResponse)
async def update_my_profile(
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
            field for field in ["username", "email"] if getattr(data, field) is not None
        ],
    )
    return updated_user


@router.delete("/me", status_code=HTTP_204_NO_CONTENT)
async def delete_my_account(
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    await delete_user(db, current_user.id)
    logger.info(
        "User account deleted successfully",
        user_id=current_user.id,
        username=current_user.username,
        email=current_user.email,
    )
    return None
