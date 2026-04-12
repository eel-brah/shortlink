from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.core.logger import get_logger
from app.models.user import User
from app.schemas.analytics import AnalyticsResponse
from app.services.analytics_service import get_url_analytics


logger = get_logger(__name__)
router = APIRouter()


@router.get("/{short_code}", response_model=AnalyticsResponse)
async def get_analytics(
    short_code: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    analytics = await get_url_analytics(db, short_code, current_user.id)
    logger.info(
        "Analytics retrieved successfully",
        short_code=short_code,
        user_id=current_user.id,
        total_clicks=analytics.get("total_clicks", 0),
    )
    return analytics
