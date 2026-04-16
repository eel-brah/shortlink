from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_

from ..models.user import User
from ..schemas.user import UserCreate, UserLogin
from ..services.utils import safe_commit
from ..core.security import hash_password, verify_password
from ..core.exceptions.base import ConflictError, UnauthorizedError


async def register_user(db: AsyncSession, data: UserCreate):
    result = await db.execute(
        select(User).where(
            or_(User.email == data.email, User.username == data.username)
        )
    )
    existing = result.scalar_one_or_none()

    if existing:
        if existing.email == data.email:
            raise ConflictError("Email already registered")
        raise ConflictError("Username already taken")

    user = User(
        username=data.username,
        email=data.email,
        password_hash=hash_password(data.password),
    )
    db.add(user)
    await safe_commit(db)
    await db.refresh(user)
    return user


async def authenticate_user(db: AsyncSession, data: UserLogin):
    conditions = []
    if data.email:
        conditions.append(User.email == data.email)
    if data.username:
        conditions.append(User.username == data.username)
    if not conditions:
        raise ValueError("No login identifier provided")

    result = await db.execute(select(User).where(or_(*conditions)))
    user = result.scalar_one_or_none()

    if not user or not verify_password(data.password, user.password_hash):
        raise UnauthorizedError("Invalid email/username or password")

    return user
