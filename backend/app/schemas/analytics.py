from pydantic import BaseModel, ConfigDict
from typing import List, Optional


class DailyClick(BaseModel):
    date: Optional[str]
    clicks: int

    model_config = ConfigDict(from_attributes=True)


class StatItem(BaseModel):
    name: str
    value: int

    model_config = ConfigDict(from_attributes=True)


class AnalyticsResponse(BaseModel):
    short_code: str
    original_url: str
    total_clicks: int
    clicks_today: int

    clicks_over_time: List[DailyClick] = []

    referrers: List[StatItem] = []
    countries: List[StatItem] = []
    devices: List[StatItem] = []
    browsers: List[StatItem] = []
    os: List[StatItem] = []

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)
