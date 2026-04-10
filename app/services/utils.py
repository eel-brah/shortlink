from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions.base import ConflictError, Error
from app.core.exceptions.handlers import logger


async def safe_commit(db: AsyncSession):
    try:
        await db.commit()
    except IntegrityError as e:
        await db.rollback()
        logger.error(f"Failed to commit: {e}")
        raise Error()
