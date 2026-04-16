from typing import Annotated
from fastapi import APIRouter, Depends, Path, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.status import HTTP_201_CREATED, HTTP_204_NO_CONTENT

from app.api.deps import get_current_user, get_current_user_optional, get_db
from app.core.limiter import limiter
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
from app.services.cache_service import (
    delete_cached_url,
    get_cached_url,
)
from app.services.url_service import (
    create_short_url,
    delete_url,
    get_user_urls,
    is_alias_available,
    update_url,
)

CustomCodePath = Annotated[
    str,
    Path(
        min_length=CUSTOM_ALIAS_MIN,
        max_length=CUSTOM_ALIAS_MAX,
        pattern=r"^[a-zA-Z0-9]+$",
    ),
]


logger = get_logger(__name__)
router = APIRouter()


@router.get("/check-alias", response_model=AliasCheckResponse)
@limiter.limit("30/minute")
async def check_alias(
    request: Request,
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
@limiter.limit("10/minute")
async def shorten(
    request: Request,
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
        expires_at=data.expires_at,
    )
    return url


@router.get("/my-urls", response_model=UrlsResponse)
@limiter.limit("60/minute")
async def get_my_urls(
    request: Request,
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


@router.put("/{short_code}", response_model=UrlResponse)
@limiter.limit("30/minute")
async def update_url_endpoint(
    request: Request,
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
@limiter.limit("30/minute")
async def delete_url_endpoint(
    request: Request,
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
