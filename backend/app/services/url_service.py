from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func, select, update

from app.core.logger import get_logger
from app.db.session import AsyncSessionLocal

from ..services.utils import safe_commit
from app.utils.utils import date_now

from ..core.exceptions.base import (
    ConflictError,
    ForbiddenError,
    NotFoundError,
)
from app.models.url import Url
from app.schemas.url import CUSTOM_ALIAS_MIN, RESERVED, UrlUpdate
from app.services.cache_service import delete_cached_url, set_cached_url
from app.utils.shortener import encode_id


logger = get_logger(__name__)

DEFAULT_TTL = 60 * 60 * 24  # 24 hours


async def create_short_url(
    db: AsyncSession,
    original_url: str,
    custom_alias: str | None,
    expires_at: datetime | None,
    user_id: int | None = None,
) -> Url:
    if custom_alias and user_id is None:
        raise ForbiddenError(
            "Custom aliases are only available for registered users. "
            "Please log in to create a custom short link."
        )

    if custom_alias:
        existing = await db.execute(select(Url).where(Url.short_code == custom_alias))
        if existing.scalar_one_or_none():
            raise ConflictError(detail="Alias already taken")

    url = Url(original_url=original_url, expires_at=expires_at, user_id=user_id)

    db.add(url)
    await db.flush()

    url.short_code = custom_alias or encode_id(url.id)

    await safe_commit(db)
    await db.refresh(url)

    return url


async def get_url(db: AsyncSession, code: str) -> Url:
    result = await db.execute(select(Url).where(Url.short_code == code, Url.is_active))
    url = result.scalar_one_or_none()
    if not url:
        raise NotFoundError(detail="Url not found")
    if url.expires_at and url.expires_at <= date_now():
        raise NotFoundError(detail="Url expired")
    return url


async def increment_click_count(code: str):
    try:
        async with AsyncSessionLocal() as db:
            async with db.begin():
                await db.execute(
                    update(Url)
                    .where(Url.short_code == code)
                    .values(click_count=Url.click_count + 1)
                )
    except Exception as e:
        logger.error(
            "Failed to increment count",
            short_code=code,
            error=str(e),
        )


async def get_total_clicks(db, user_id: int) -> int:
    result = await db.execute(
        select(func.coalesce(func.sum(Url.click_count), 0)).where(
            Url.user_id == user_id
        )
    )
    return result.scalar_one()


async def get_user_urls(db: AsyncSession, user_id: int, page: int = 1, size: int = 10):
    page = max(1, page)
    size = max(1, min(100, size))

    offset = (page - 1) * size

    count_query = select(func.count()).select_from(Url).where(Url.user_id == user_id)
    total = (await db.execute(count_query)).scalar_one() or 0

    result = await db.execute(
        select(Url)
        .where(Url.user_id == user_id)
        .order_by(Url.id.desc())
        .offset(offset)
        .limit(size)
    )
    urls = result.scalars().all()

    total_clicks = await get_total_clicks(db, user_id)

    return {
        "items": urls,
        "total": total,
        "page": page,
        "size": size,
        "pages": (total + size - 1) // size if total > 0 else 0,
        "total_clicks": total_clicks,
    }


async def update_url(
    db: AsyncSession, short_code: str, data: UrlUpdate, user_id: int
) -> Url:
    result = await db.execute(select(Url).where(Url.short_code == short_code))
    url = result.scalar_one_or_none()

    if not url:
        raise NotFoundError(detail="Url not found")

    if url.user_id != user_id:
        raise ForbiddenError(detail="Not allowed to modify this URL")

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
            select(Url).where(Url.short_code == data.custom_alias)
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


async def delete_url(db, short_code: str, user_id: int) -> Url:
    result = await db.execute(select(Url).where(Url.short_code == short_code))
    url = result.scalar_one_or_none()
    if not url:
        raise NotFoundError(detail="Url not found")

    if url.user_id != user_id:
        raise ForbiddenError(detail="Not allowed to modify this URL")

    # TODO: soft delete to keep analytics/history
    await db.delete(url)
    await safe_commit(db)

    return url


async def is_alias_available(db, alias: str) -> bool:
    alias = alias.strip()
    if alias in RESERVED or len(alias) < CUSTOM_ALIAS_MIN:
        return False
    result = await db.execute(select(Url.id).where(Url.short_code == alias))
    return result.scalar_one_or_none() is None


def compute_ttl(expires_at: datetime | None) -> int:
    if not expires_at:
        return DEFAULT_TTL

    remaining = int((expires_at - date_now()).total_seconds())
    if remaining <= 0:
        return 0

    return min(DEFAULT_TTL, remaining)
