from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.utils.utils import date_now

from ..core.exceptions.base import ConflictError, NotFoundError
from app.models.url import URL
from app.schemas.url import CUSTOM_ALIAS_MIN, RESERVED, URLUpdate
from app.services.cache_service import delete_cached_url, set_cached_url
from app.utils.shortener import encode_id

DEFAULT_TTL = 60 * 60 * 24  # 24 hours


async def safe_commit(db: AsyncSession):
    from sqlalchemy.exc import IntegrityError

    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise ConflictError("Database conflict")


async def create_short_url(
    db: AsyncSession,
    original_url: str,
    custom_alias: str | None,
    expires_at: datetime | None,
):
    if custom_alias:
        existing = await db.execute(select(URL).where(URL.short_code == custom_alias))
        if existing.scalar_one_or_none():
            raise ConflictError(detail="Alias already taken")

    url = URL(original_url=original_url, expires_at=expires_at)

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
    if url.expires_at and url.expires_at <= date_now():
        raise NotFoundError(detail="URL expired")
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
        and data.expires_at is None
    ):
        return url

    if data.original_url:
        url.original_url = str(data.original_url)

    if data.is_active is not None:
        url.is_active = data.is_active

    if data.expires_at is not None:
        url.expires_at = data.expires_at

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
        ttl = compute_ttl(url.expires_at)
        if ttl > 0:
            await set_cached_url(url.short_code, url.original_url, ttl)
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


async def is_alias_available(db, alias: str):
    alias = alias.strip()
    if alias in RESERVED or len(alias) < CUSTOM_ALIAS_MIN:
        return {"available": False}
    result = await db.execute(select(URL.id).where(URL.short_code == alias))
    return result.scalar_one_or_none() is None


def compute_ttl(expires_at: datetime | None):
    if not expires_at:
        return DEFAULT_TTL

    remaining = int((expires_at - date_now()).total_seconds())
    if remaining <= 0:
        return 0

    return min(DEFAULT_TTL, remaining)
