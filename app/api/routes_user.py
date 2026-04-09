from fastapi import APIRouter, Depends 
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.status import HTTP_204_NO_CONTENT
from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate
from app.services.user_service import (
    delete_user,
    update_user,
)

router = APIRouter()


@router.put("/me", response_model=UserResponse)
async def update_my_profile(
    data: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await update_user(db, current_user.id, data)


@router.delete("/me", status_code=HTTP_204_NO_CONTENT)
async def delete_my_account(
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    await delete_user(db, current_user.id)
    return None
