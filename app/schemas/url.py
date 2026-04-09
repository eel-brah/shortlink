from datetime import datetime
from typing import Annotated
from pydantic import (
    AfterValidator,
    BaseModel,
    ConfigDict,
    Field,
    HttpUrl,
)

from ..utils.utils import date_now


RESERVED = {"admin", "api", "docs", "redoc"}
CUSTOM_ALIAS_MIN = 6
CUSTOM_ALIAS_MAX = 20


AliasType = Annotated[
    str,
    Field(
        min_length=CUSTOM_ALIAS_MIN,
        max_length=CUSTOM_ALIAS_MAX,
        pattern=r"^[a-zA-Z0-9]+$",
    ),
]


def validate_alias(value: str | None) -> str | None:
    if value is None:
        return value

    if value in RESERVED:
        raise ValueError("Alias is reserved")

    return value


def validate_expiration(value):
    if value and value <= date_now():
        raise ValueError("Expiration must be in the future")
    return value


class UrlCreate(BaseModel):
    url: HttpUrl
    custom_alias: Annotated[AliasType | None, AfterValidator(validate_alias)] = None
    expires_at: Annotated[datetime | None, AfterValidator(validate_expiration)] = None


class UrlUpdate(BaseModel):
    original_url: HttpUrl | None = None
    custom_alias: Annotated[AliasType | None, AfterValidator(validate_alias)] = None
    is_active: bool | None = None
    expires_at: Annotated[datetime | None, AfterValidator(validate_expiration)] = None


class UrlResponse(BaseModel):
    id: int
    original_url: str
    short_code: str
    is_active: bool
    expires_at: datetime | None

    model_config = ConfigDict(from_attributes=True)


class AliasCheckResponse(BaseModel):
    available: bool
