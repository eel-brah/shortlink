from typing import Annotated
from fastapi import APIRouter, BackgroundTasks, Depends, Path, Query, Request
from pydantic import Field
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.status import HTTP_201_CREATED, HTTP_204_NO_CONTENT

from app.api.deps import get_current_user, get_current_user_optional, get_db
from app.core.exceptions.base import NotFoundError
from app.core.logger import get_logger
from app.models.user import User
from app.schemas.url import (
    CUSTOM_ALIAS_MAX,
    CUSTOM_ALIAS_MIN,
    AliasCheckResponse,
    UrlCreate,
    UrlResponse,
    UrlUpdate,
    UrlsResponse,
)
from app.services.analytics_service import record_click
from app.services.cache_service import (
    delete_cached_url,
    get_cached_url,
    set_cached_url,
)
from app.services.url_service import (
    compute_ttl,
    create_short_url,
    delete_url,
    get_url,
    get_user_urls,
    increment_click_count,
    is_alias_available,
    update_url,
)

logger = get_logger(__name__)
router = APIRouter()


@router.get("/check-alias", response_model=AliasCheckResponse)
async def check_alias(
    alias: str = Query(
        min_length=CUSTOM_ALIAS_MIN,
        max_length=CUSTOM_ALIAS_MAX,
        pattern=r"^[a-zA-Z0-9]+$",
    ),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    cached_url = await get_cached_url(alias)
    if cached_url:
        return {"available": False}
    exists = await is_alias_available(db, alias)
    logger.info(
        "Alias availability checked",
        alias=alias,
        available=exists,
        user_id=current_user.id,
    )
    return {"available": exists}


@router.post("/", response_model=UrlResponse, status_code=HTTP_201_CREATED)
async def shorten(
    data: UrlCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional),
):
    url = await create_short_url(
        db,
        str(data.url),
        data.custom_alias,
        data.expires_at,
        user_id=current_user.id if current_user else None,
    )
    logger.info(
        "Short URL created",
        short_code=url.short_code,
        original_url=str(data.url)[:100],
        user_id=current_user.id if current_user else None,
        is_custom=bool(data.custom_alias),
    )
    return url


@router.get("/my-urls", response_model=UrlsResponse)
async def get_my_urls(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(10, ge=1, le=100, description="Items per page (max 100)"),
):
    result = await get_user_urls(db, current_user.id, page=page, size=size)
    logger.info(
        "User URLs retrieved",
        user_id=current_user.id,
        page=page,
        size=size,
        total=result.get("total", 0),
    )
    return result

CustomCodePath = Annotated[
    str,
    Path(
        min_length=CUSTOM_ALIAS_MIN,
        max_length=CUSTOM_ALIAS_MAX,
        pattern=r"^[a-zA-Z0-9]+$",
    ),
]

@router.get("/{code}")
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

    # return RedirectResponse(url=original_url, status_code=307)
    return original_url


@router.put("/{short_code}", response_model=UrlResponse)
async def update_url_endpoint(
    short_code: CustomCodePath,
    data: UrlUpdate,
    db=Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    url = await update_url(db, short_code, data, current_user.id)
    logger.info(
        "URL updated",
        short_code=url.short_code,
        user_id=current_user.id,
    )
    return url


@router.delete("/{short_code}", status_code=HTTP_204_NO_CONTENT)
async def delete_url_endpoint(
    short_code: CustomCodePath,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    url = await delete_url(db, short_code, current_user.id)
    logger.info(
        "URL deleted",
        short_code=url.short_code,
        user_id=current_user.id,
    )
    await delete_cached_url(url.short_code)
    return None
