from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db
from app.schemas.url import URLCreate, URLResponse, URLUpdate
from app.services.cache_service import delete_cached_url, get_cached_url, set_cached_url
from app.services.url_service import create_short_url, delete_url, get_url, update_url

router = APIRouter()


@router.post("/shorten", response_model=URLResponse)
async def shorten(data: URLCreate, db: AsyncSession = Depends(get_db)):
    url = await create_short_url(db, str(data.url))
    return url


@router.get("/{code}")
async def redirect(code: str, db: AsyncSession = Depends(get_db)):
    cached_url = await get_cached_url(code)
    if cached_url:
        return cached_url

    url = await get_url(db, code)
    if not url:
        raise HTTPException(status_code=404, detail="Not found")

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
    if not url:
        raise HTTPException(status_code=404, detail="URL not found")

    await delete_cached_url(url.short_code)
    return url
