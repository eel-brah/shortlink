from typing import Annotated
from pydantic import (
    AfterValidator,
    BaseModel,
    ConfigDict,
    Field,
    HttpUrl,
)


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


class URLCreate(BaseModel):
    url: HttpUrl
    custom_alias: Annotated[AliasType | None, AfterValidator(validate_alias)] = None


class URLUpdate(BaseModel):
    original_url: HttpUrl | None = None
    custom_alias: Annotated[AliasType | None, AfterValidator(validate_alias)] = None
    is_active: bool | None = None


class URLResponse(BaseModel):
    id: int
    original_url: str
    short_code: str
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


class AliasCheckResponse(BaseModel):
    available: bool
