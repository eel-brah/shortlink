from redis.asyncio import RedisError

from ..core.redis import redis
import logging

logger = logging.getLogger(__name__)


async def get_cached_url(code: str) -> str | None:
    try:
        return await redis.get(code)
    except RedisError:
        logger.warning("Redis GET failed", exc_info=True)
        return None


async def set_cached_url(code: str, original_url: str, ttl: int):
    try:
        await redis.set(code, original_url, ex=ttl)
    except RedisError:
        logger.warning("Redis SET failed", exc_info=True)


async def delete_cached_url(code: str):
    try:
        await redis.delete(code)
    except RedisError:
        logger.warning("Redis DELETE failed", exc_info=True)
