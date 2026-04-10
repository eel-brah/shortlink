from pydantic import BaseModel, ConfigDict
from datetime import date
from typing import List


class DailyClick(BaseModel):
    date: date | None
    count: int


class StatItem(BaseModel):
    label: str
    count: int


class AnalyticsResponse(BaseModel):
    short_code: str
    original_url: str
    total_clicks: int
    daily_clicks: List[DailyClick]
    top_countries: List[StatItem] = []
    top_devices: List[StatItem] = []
    top_browsers: List[StatItem] = []
    top_os: List[StatItem] = []

    model_config = ConfigDict(from_attributes=True)
