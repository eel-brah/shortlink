from redis.asyncio import Redis
from app.core.config import settings

redis = Redis.from_url(
    str(settings.REDIS_URL),
    decode_responses=True 
)
