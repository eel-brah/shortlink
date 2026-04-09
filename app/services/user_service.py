from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..models.user import User
from ..schemas.user import UserUpdate
from ..services.utils import safe_commit
from ..core.security import hash_password, verify_password
from ..core.exceptions.base import ConflictError, NotFoundError


async def update_user(db: AsyncSession, user_id: int, data: UserUpdate):
    # TODO: check if username and email already exist
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise NotFoundError("User not found")

    # TODO: if no password but new_password raise error
    if data.password:
        if not verify_password(data.password, user.password_hash):
            raise ConflictError("Current password incorrect")

        if data.new_password:
            user.password_hash = hash_password(data.new_password)

    if data.username:
        user.username = data.username
    if data.email:
        user.email = data.email

    await safe_commit(db)
    await db.refresh(user)
    return user


async def delete_user(db: AsyncSession, user_id: int):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise NotFoundError("User not found")

    await db.delete(user)
    await safe_commit(db)

    return user


async def get_user(db: AsyncSession, user_id: int) -> User | None:
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()
