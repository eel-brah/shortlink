from typing import Optional, Annotated
from pydantic import BaseModel, ConfigDict, Field, HttpUrl, field_validator


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


class AliasValidatorMixin:
    @field_validator("custom_alias")
    @classmethod
    def validate_alias(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value

        if value in RESERVED:
            raise ValueError("Alias is reserved")

        return value


class URLCreate(AliasValidatorMixin, BaseModel):
    url: HttpUrl
    custom_alias: Optional[AliasType] = None


class URLUpdate(AliasValidatorMixin, BaseModel):
    original_url: Optional[HttpUrl] = None
    custom_alias: Optional[AliasType] = None
    is_active: Optional[bool] = None


class URLResponse(BaseModel):
    id: int
    original_url: str
    short_code: str
    is_active: bool

    model_config = ConfigDict(from_attributes=True)
