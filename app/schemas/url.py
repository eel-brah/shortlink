from typing import Optional
from pydantic import BaseModel, ConfigDict, HttpUrl


class URLCreate(BaseModel):
    url: HttpUrl


class URLResponse(BaseModel):
    id: int
    original_url: str
    short_code: str
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


class URLUpdate(BaseModel):
    original_url: Optional[HttpUrl] = None
    custom_alias: Optional[str] = None
    is_active: Optional[bool] = None
