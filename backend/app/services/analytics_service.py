from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.logger import get_logger
from app.db.session import AsyncSessionLocal
from app.models.analytics import UrlClick
from app.models.url import Url
from app.core.exceptions.base import NotFoundError
from app.services.utils import safe_commit
from app.utils.utils import date_now, get_country, parse_user_agent

logger = get_logger(__name__)


async def record_click(
    code: str,
    ip_address: str | None = None,
    user_agent: str | None = None,
    referrer: str | None = None,
):
    try:
        async with AsyncSessionLocal() as db:
            logger.info("URL redirected", short_code=code, ip=ip_address)

            result = await db.execute(select(Url).where(Url.short_code == code))
            url = result.scalar_one_or_none()

            if not url:
                logger.error(
                    "Failed to record click",
                    short_code=code,
                    error="Url not found",
                )
                return

            country = get_country(ip_address)
            ua_data = parse_user_agent(user_agent)

            device = ua_data["device"]
            browser = ua_data["browser"]
            os = ua_data["os"]

            click = UrlClick(
                url_id=url.id,
                ip_address=ip_address,
                user_agent=user_agent,
                referrer=referrer,
                country=country,
                device=device,
                browser=browser,
                os=os,
            )
            db.add(click)
            await safe_commit(db)
    except Exception as e:
        logger.error(
            "Failed to record click",
            short_code=code,
            error=str(e),
        )


async def get_gloabal_analytics_service(db: AsyncSession, user_id: int):
    now = date_now()
    start = now - timedelta(days=7)

    result = await db.execute(
        select(
            func.date_trunc("day", UrlClick.clicked_at).label("date"),
            func.count().label("clicks"),
        )
        .join(UrlClick.url)
        .where(Url.user_id == user_id)
        .where(UrlClick.clicked_at >= start)
        .group_by("date")
        .order_by("date")
    )

    rows = result.all()
    return rows


async def get_url_analytics(
    db: AsyncSession, code: str, current_user_id: int, tz: str = "UTC"
):
    url_result = await db.execute(
        select(Url).where(Url.short_code == code, Url.user_id == current_user_id)
    )
    url = url_result.scalar_one_or_none()
    if not url:
        raise NotFoundError(detail="URL not found")

    total_clicks = await db.execute(
        select(func.count()).select_from(UrlClick).where(UrlClick.url_id == url.id)
    )
    total = total_clicks.scalar() or 0

    thirty_days_ago = date_now() - timedelta(days=30)
    date_expr = func.date_trunc("day", func.timezone(tz, UrlClick.clicked_at))

    daily_query = await db.execute(
        select(
            date_expr.label("date"),
            func.count().label("count"),
        )
        .where(UrlClick.url_id == url.id, UrlClick.clicked_at >= thirty_days_ago)
        .group_by(date_expr)
        .order_by(date_expr)
    )

    daily_rows = daily_query.all()

    referrer_query = await db.execute(
        select(UrlClick.referrer, func.count().label("count"))
        .where(UrlClick.url_id == url.id)
        .group_by(UrlClick.referrer)
        .order_by(func.count().desc())
        .limit(5)
    )

    country_query = await db.execute(
        select(UrlClick.country, func.count().label("count"))
        .where(UrlClick.url_id == url.id)
        .group_by(UrlClick.country)
        .order_by(func.count().desc())
        .limit(5)
    )

    device_query = await db.execute(
        select(UrlClick.device, func.count().label("count"))
        .where(UrlClick.url_id == url.id)
        .group_by(UrlClick.device)
        .order_by(func.count().desc())
        .limit(5)
    )

    browser_query = await db.execute(
        select(UrlClick.browser, func.count().label("count"))
        .where(UrlClick.url_id == url.id)
        .group_by(UrlClick.browser)
        .order_by(func.count().desc())
        .limit(5)
    )

    os_query = await db.execute(
        select(UrlClick.os, func.count().label("count"))
        .where(UrlClick.url_id == url.id)
        .group_by(UrlClick.os)
        .order_by(func.count().desc())
        .limit(5)
    )

    today = datetime.now(ZoneInfo(tz)).date()

    clicks_today = sum(
        int(r.count) for r in daily_rows if r.date and r.date.date() == today
    )
    return {
        "short_code": code,
        "original_url": url.original_url,
        "total_clicks": total,
        "clicks_today": clicks_today,
        "clicks_over_time": [
            {
                "date": r.date.isoformat() if r.date else None,
                "clicks": r.count,
            }
            for r in daily_rows
        ],
        "devices": [
            {"name": d.device or "Unknown", "value": d.count} for d in device_query
        ],
        "countries": [
            {"name": c.country or "Unknown", "value": c.count} for c in country_query
        ],
        "referrers": [
            {"name": r.referrer or "Direct", "value": r.count} for r in referrer_query
        ],
        "browsers": [
            {"name": b.browser or "Unknown", "value": b.count} for b in browser_query
        ],
        "os": [{"name": o.os or "Unknown", "value": o.count} for o in os_query],
    }
