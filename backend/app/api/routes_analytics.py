from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.core.logger import get_logger
from app.models.user import User
from app.schemas.analytics import AnalyticsResponse
from app.services.analytics_service import (
    get_gloabal_analytics_service,
    get_url_analytics,
)


logger = get_logger(__name__)
router = APIRouter()


@router.get("/global")
async def get_global_analytics(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rows = await get_gloabal_analytics_service(db, current_user.id)
    logger.info(
        "Analytics retrieved successfully",
        user_id=current_user.id,
    )
    return [
        {
            "date": r.date.isoformat(),
            "clicks": r.clicks,
        }
        for r in rows
    ]


@router.get("/{short_code}", response_model=AnalyticsResponse)
async def get_analytics(
    short_code: str,
    tz: str = Query(),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    analytics = await get_url_analytics(db, short_code, current_user.id, tz)
    logger.info(
        "Analytics retrieved successfully",
        short_code=short_code,
        user_id=current_user.id,
        total_clicks=analytics.get("total_clicks", 0),
    )
    return analytics
