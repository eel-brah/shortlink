from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.url import URL

from app.utils.shortener import encode_id


async def create_short_url(db: AsyncSession, original_url: str):
    url = URL(original_url=original_url)

    db.add(url)
    await db.flush()

    url.short_code = encode_id(url.id)

    await db.commit()
    await db.refresh(url)

    return url


async def get_url(db: AsyncSession, code: str):
    result = await db.execute(
        # is_active
        select(URL).where(URL.short_code == code)
    )
    return result.scalar_one_or_none()
