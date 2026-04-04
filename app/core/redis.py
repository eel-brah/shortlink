from redis.asyncio import Redis
from app.core.config import settings

redis = Redis.from_url(
    str(settings.REDIS_URL),
    decode_responses=True,
    socket_timeout=settings.REDIS_TIMEOUT,
    socket_connect_timeout=settings.REDIS_TIMEOUT,
)
