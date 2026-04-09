from argon2.profiles import RFC_9106_LOW_MEMORY
from pydantic import SecretStr
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError, InvalidHashError

pwd_hasher = PasswordHasher.from_parameters(RFC_9106_LOW_MEMORY)


def hash_password(password: str | SecretStr) -> str:
    if isinstance(password, SecretStr):
        plain_password = password.get_secret_value()
    else:
        plain_password = password

    if not plain_password:
        raise ValueError("Cannot hash empty password")

    return pwd_hasher.hash(plain_password)


def verify_password(plain_password: str | SecretStr, hashed_password: str) -> bool:
    if isinstance(plain_password, SecretStr):
        plain_password = plain_password.get_secret_value()

    try:
        return pwd_hasher.verify(hashed_password, plain_password)
    except (VerifyMismatchError, InvalidHashError):
        return False
    except Exception:
        raise Exception("Cannot hash empty password")
