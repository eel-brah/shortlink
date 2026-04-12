from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions.base import Error
from app.core.logger import get_logger

logger = get_logger(__name__)


async def safe_commit(db: AsyncSession):
    try:
        await db.commit()
    except IntegrityError as e:
        await db.rollback()
        logger.error(
            "Failed to commit",
            error=str(e),
        )
        raise Error()
