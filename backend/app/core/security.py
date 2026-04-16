from argon2.profiles import RFC_9106_LOW_MEMORY
from pydantic import SecretStr
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError, InvalidHashError
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

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


#TODO:
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response: Response = await call_next(request)

        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Strict-Transport-Security"] = (
            "max-age=63072000; includeSubDomains; preload"
        )
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

        response.headers["X-XSS-Protection"] = "0"

        # response.headers["Content-Security-Policy"] = (
        #     "default-src 'none'; "
        #     "script-src 'self'; "
        #     "style-src 'self' 'unsafe-inline'; "
        #     "img-src 'self' data:; "
        #     "connect-src 'self'; "
        #     "frame-ancestors 'none';"
        # )

        response.headers["Permissions-Policy"] = (
            "geolocation=(), microphone=(), camera=()"
        )
        # response.headers["Cross-Origin-Opener-Policy"] = "same-origin"
        # response.headers["Cross-Origin-Embedder-Policy"] = "require-corp"
        # response.headers["Cross-Origin-Resource-Policy"] = "same-origin"

        return response
