from fastapi import APIRouter, BackgroundTasks, Depends, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db
from app.api.routes_url import CustomCodePath
from app.core.limiter import limiter
from app.core.exceptions.base import NotFoundError
from app.core.logger import get_logger
from app.services.analytics_service import record_click
from app.services.cache_service import (
    get_cached_url,
    set_cached_url,
)
from app.services.url_service import compute_ttl, get_url, increment_click_count

logger = get_logger(__name__)
router = APIRouter()


@router.get("/{code}")
@limiter.limit("1000/minute")
async def redirect(
    background_tasks: BackgroundTasks,
    request: Request,
    code: CustomCodePath,
    db: AsyncSession = Depends(get_db),
):
    original_url = await get_cached_url(code)
    if not original_url:
        url = await get_url(db, code)
        ttl = compute_ttl(url.expires_at)
        original_url = url.original_url
        if ttl == 0:
            raise NotFoundError("Url expired")
        await set_cached_url(code, original_url, ttl)

    background_tasks.add_task(increment_click_count, code)
    background_tasks.add_task(
        record_click,
        code=code,
        ip_address=(
            request.headers.get("x-forwarded-for", "").split(",")[0]
            or (request.client.host if request.client else None)
        ),
        user_agent=request.headers.get("user-agent"),
        referrer=request.headers.get("referer"),
    )

    return RedirectResponse(url=original_url, status_code=307)
