from fastapi import APIRouter, BackgroundTasks, Depends, Path, Query
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.status import HTTP_201_CREATED, HTTP_204_NO_CONTENT

from app.api.deps import get_current_user, get_current_user_optional, get_db
from app.core.exceptions.base import NotFoundError
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

router = APIRouter()


@router.get("/check-alias", response_model=AliasCheckResponse)
async def check_alias(
    alias: str = Query(
        min_length=CUSTOM_ALIAS_MIN,
        max_length=CUSTOM_ALIAS_MAX,
        pattern=r"^[a-zA-Z0-9]+$",
    ),
    db: AsyncSession = Depends(get_db),
):
    cached_url = await get_cached_url(alias)
    if cached_url:
        return {"available": False}
    exists = await is_alias_available(db, alias)
    return {"available": exists}


# TODO: correct the status code in all routes
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
    return url


@router.get("/my-urls", response_model=UrlsResponse)
async def get_my_urls(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(10, ge=1, le=100, description="Items per page (max 100)"),
):
    result = await get_user_urls(db, current_user.id, page=page, size=size)
    return result


@router.get("/{code}")
async def redirect(
    background_tasks: BackgroundTasks,
    code: str = Path(
        min_length=CUSTOM_ALIAS_MIN,
        max_length=CUSTOM_ALIAS_MAX,
        pattern=r"^[a-zA-Z0-9]+$",
    ),
    db: AsyncSession = Depends(get_db),
):
    cached_url = await get_cached_url(code)
    if cached_url:
        background_tasks.add_task(increment_click_count, code)
        return cached_url
    url = await get_url(db, background_tasks, code)

    ttl = compute_ttl(url.expires_at)
    if ttl == 0:
        raise NotFoundError("Url expired")
    await set_cached_url(code, url.original_url, ttl)

    return url.original_url


@router.put("/{url_id}", response_model=UrlResponse)
async def update_url_endpoint(
    url_id: int,
    data: UrlUpdate,
    db=Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    url = await update_url(db, url_id, data, current_user.id)
    return url


@router.delete("/{url_id}", status_code=HTTP_204_NO_CONTENT)
async def delete_url_endpoint(
    url_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    url = await delete_url(db, url_id, current_user.id)
    await delete_cached_url(url.short_code)
    return None
