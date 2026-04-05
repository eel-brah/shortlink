from fastapi import APIRouter, Depends, HTTPException, Path
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db
from app.schemas.url import (
    CUSTOM_ALIAS_MAX,
    CUSTOM_ALIAS_MIN,
    URLCreate,
    URLResponse,
    URLUpdate,
)
from app.services.cache_service import delete_cached_url, get_cached_url, set_cached_url
from app.services.url_service import create_short_url, delete_url, get_url, update_url

router = APIRouter()

# TODO: Consistent Error Format
# TODO: Data base errors


@router.post("/shorten", response_model=URLResponse)
async def shorten(data: URLCreate, db: AsyncSession = Depends(get_db)):
    url = await create_short_url(db, str(data.url), data.custom_alias)
    return url


@router.get("/{code}")
async def redirect(
    code: str = Path(
        min_length=CUSTOM_ALIAS_MIN,
        max_length=CUSTOM_ALIAS_MAX,
        pattern=r"^[a-zA-Z0-9]+$",
    ),
    db: AsyncSession = Depends(get_db),
):
    cached_url = await get_cached_url(code)
    if cached_url:
        return cached_url
    url = await get_url(db, code)
    await set_cached_url(code, url.original_url)
    return url.original_url


@router.put("/urls/{url_id}", response_model=URLResponse)
async def update_url_endpoint(
    url_id: int,
    data: URLUpdate,
    db=Depends(get_db),
):
    url = await update_url(db, url_id, data)
    return url


@router.delete("/urls/{url_id}", response_model=URLResponse)
async def delete_url_endpoint(url_id: int, db: AsyncSession = Depends(get_db)):
    url = await delete_url(db, url_id)
    await delete_cached_url(url.short_code)
    return url


# TODO: add check-alias
