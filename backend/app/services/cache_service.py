from redis.asyncio import RedisError

from app.core.logger import get_logger

from ..core.redis import redis

logger = get_logger(__name__)


async def get_cached_url(code: str) -> str | None:
    try:
        return await redis.get(code)
    except RedisError as e:
        logger.warning(
            "Redis GET operation failed",
            short_code=code,
            error=str(e),
        )
        return None


async def set_cached_url(code: str, original_url: str, ttl: int):
    try:
        await redis.set(code, original_url, ex=ttl)
    except RedisError as e:
        logger.warning(
            "Redis SET operation failed",
            short_code=code,
            ttl=ttl,
            error=str(e),
        )


async def delete_cached_url(code: str):
    try:
        await redis.delete(code)
    except RedisError as e:
        logger.warning(
            "Redis DELETE operation failed",
            short_code=code,
            error=str(e),
        )
