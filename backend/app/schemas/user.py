from datetime import datetime
import re
from typing import Annotated
from typing_extensions import Self
from pydantic import (
    AfterValidator,
    BaseModel,
    ConfigDict,
    EmailStr,
    Field,
    SecretStr,
    model_validator,
)

UserNAME_MIN = 3
UserNAME_MAX = 20
PASSWORD_MIN_LENGTH = 12
PASSWORD_MAX_LENGTH = 128
PASSPHRASE_MIN_WORDS = 5
PASSPHRASE_MIN_LENGTH = 15

COMMON_PASSWORDS = {
    "password",
    "123456",
    "12345678",
    "qwerty",
    "admin",
    "welcome",
    "letmein",
    "abc123",
    "password1",
    "iloveyou",
    "monkey",
    "123456789",
    # Add more
}


def validate_password(password: SecretStr | None) -> SecretStr | None:
    if password is None:
        return None

    password_value = password.get_secret_value()
    if not password_value:
        raise ValueError("Password cannot be empty")

    if len(password_value) > PASSWORD_MAX_LENGTH:
        raise ValueError(
            f"Password must be at most {PASSWORD_MAX_LENGTH} characters long"
        )

    words = [w for w in password_value.split() if w]
    if len(words) >= PASSPHRASE_MIN_WORDS:
        if len(password_value) < PASSPHRASE_MIN_LENGTH:
            raise ValueError(
                f"Passphrase must be at least {PASSPHRASE_MIN_LENGTH} characters long"
            )
        if all(len(w) <= 2 or w.lower() in COMMON_PASSWORDS for w in words):
            raise ValueError("Passphrase is too weak or uses common words")
        return password

    if len(password_value) < PASSWORD_MIN_LENGTH:
        raise ValueError(
            f"Password must be at least {PASSWORD_MIN_LENGTH} characters long, "
            f"or use a passphrase with at least {PASSPHRASE_MIN_WORDS} words"
        )

    pw_lower = password_value.lower()
    if pw_lower in COMMON_PASSWORDS or pw_lower in {p + "1" for p in COMMON_PASSWORDS}:
        raise ValueError("This password is too common and easily guessable")

    if re.match(r"^(.)\1{5,}$", password_value):
        raise ValueError("Password is too repetitive")

    return password


Username = Annotated[
    str,
    Field(
        min_length=UserNAME_MIN,
        max_length=UserNAME_MAX,
        pattern=r"^[a-zA-Z0-9_]+$",
    ),
]
Password = Annotated[SecretStr, AfterValidator(validate_password)]
OptionalPassword = Annotated[SecretStr | None, AfterValidator(validate_password)]


class UserCreate(BaseModel):
    username: Username
    email: EmailStr
    password: Password


class UserLogin(BaseModel):
    username: Username | None = None
    email: EmailStr | None = None
    password: SecretStr = Field(..., max_length=PASSWORD_MAX_LENGTH)

    @model_validator(mode="after")
    def check_for_email_or_username(self) -> Self:
        if not self.username and not self.email:
            raise ValueError("Either username or email must be provided")
        return self


class UserUpdate(BaseModel):
    username: Username | None = None
    email: EmailStr | None = None
    password: OptionalPassword = None
    new_password: OptionalPassword = None
    new_password_repeat: SecretStr | None = Field(
        default=None, max_length=PASSWORD_MAX_LENGTH
    )

    @model_validator(mode="after")
    def check_passwords_match(self) -> Self:
        if self.new_password is not None or self.new_password_repeat is not None:
            if self.new_password is None or self.new_password_repeat is None:
                raise ValueError(
                    "Both new password and repeat new password are required"
                )
            if self.new_password != self.new_password_repeat:
                raise ValueError("New passwords do not match")
        return self


class UserResponse(BaseModel):
    username: Username
    email: EmailStr
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
