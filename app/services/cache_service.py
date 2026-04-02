from ..core.redis import redis

DEFAULT_TTL = 60 * 60 * 24  # 24 hours

async def get_cached_url(code: str) -> str | None:
    return await redis.get(code)


async def set_cached_url(code: str, original_url: str):
    await redis.set(code, original_url, ex=DEFAULT_TTL)

async def delete_cached_url(code: str):
    await redis.delete(code)
