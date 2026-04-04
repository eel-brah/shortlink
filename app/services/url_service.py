from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from ..core.exceptions.base import ConflictError, NotFoundError
from app.models.url import URL
from app.schemas.url import URLUpdate
from app.services.cache_service import delete_cached_url, set_cached_url
from app.utils.shortener import encode_id


async def safe_commit(db: AsyncSession):
    from sqlalchemy.exc import IntegrityError

    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise ConflictError("Database conflict")


async def create_short_url(
    db: AsyncSession, original_url: str, custom_alias: str | None
):
    if custom_alias:
        existing = await db.execute(select(URL).where(URL.short_code == custom_alias))
        if existing.scalar_one_or_none():
            raise ConflictError(detail="Alias already taken")

    url = URL(original_url=original_url)

    db.add(url)
    await db.flush()

    url.short_code = custom_alias or encode_id(url.id)

    await safe_commit(db)
    await db.refresh(url)

    return url


async def get_url(db: AsyncSession, code: str):
    result = await db.execute(select(URL).where(URL.short_code == code, URL.is_active))
    url = result.scalar_one_or_none()
    if not url:
        raise NotFoundError(detail="URL not found")
    return url


async def update_url(db: AsyncSession, url_id: int, data: URLUpdate):
    result = await db.execute(select(URL).where(URL.id == url_id))
    url = result.scalar_one_or_none()

    if not url:
        raise NotFoundError(detail="URL not found")

    if (
        data.original_url is None
        and data.is_active is None
        and data.custom_alias is None
    ):
        return url

    if data.original_url:
        url.original_url = str(data.original_url)

    if data.is_active is not None:
        url.is_active = data.is_active

    if data.custom_alias and data.custom_alias != url.short_code:
        existing = await db.execute(
            select(URL).where(URL.short_code == data.custom_alias)
        )
        if existing.scalar_one_or_none():
            raise ConflictError(detail="Alias already taken")

        await delete_cached_url(url.short_code)

        url.short_code = data.custom_alias

    await safe_commit(db)
    await db.refresh(url)

    if url.is_active:
        await set_cached_url(url.short_code, url.original_url)
    else:
        await delete_cached_url(url.short_code)

    return url


async def delete_url(db, url_id: int):
    result = await db.execute(select(URL).where(URL.id == url_id))
    url = result.scalar_one_or_none()
    if not url:
        raise NotFoundError(detail="URL not found")

    # TODO: soft delete to keep analytics/history
    await db.delete(url)
    await safe_commit(db)

    return url
