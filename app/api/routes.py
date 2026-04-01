from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db
from app.schemas.url import URLCreate, URLResponse
from app.services.url_service import create_short_url, get_url

router = APIRouter()


@router.post("/shorten", response_model=URLResponse)
async def shorten(data: URLCreate, db: AsyncSession = Depends(get_db)):
    url = await create_short_url(db, str(data.url))
    return url


@router.get("/{code}", response_model=URLResponse)
async def redirect(code: str, db: AsyncSession = Depends(get_db)):
    url = await get_url(db, code)

    if not url:
        raise HTTPException(status_code=404, detail="Not found")

    return url
