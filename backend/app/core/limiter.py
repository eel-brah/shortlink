from fastapi import Request
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.api.deps import get_user_id_from_request
from app.core.config import settings


def user_or_ip_key(request: Request):
    user_id = get_user_id_from_request(request)
    if user_id:
        return f"user:{user_id}"
    return get_remote_address(request)


limiter = Limiter(key_func=user_or_ip_key, storage_uri=str(settings.REDIS_URL))
