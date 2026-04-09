from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions.base import ConflictError


async def safe_commit(db: AsyncSession):

    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise ConflictError("Database conflict")
