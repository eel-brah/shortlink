from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from pydantic import ValidationError as PydanticValidationError
from slowapi.errors import RateLimitExceeded
from app.core.exceptions.base import BaseAppException

from app.core.logger import get_logger

logger = get_logger(__name__)


def clean_errors(errors):
    return [
        {"msg": str(e.get("msg")), "field": ".".join(map(str, e.get("loc", [])))}
        for e in errors
    ]


def register_exception_handlers(app):
    @app.exception_handler(BaseAppException)
    async def app_exception_handler(request: Request, exc: BaseAppException):
        logger.error(
            "Application error occurred",
            detail=exc.detail,
            status_code=exc.status_code,
            path=str(request.url),
            method=request.method,
        )
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail},
        )

    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException):
        logger.warning(
            "HTTP exception occurred",
            status_code=exc.status_code,
            detail=exc.detail,
            path=str(request.url),
            method=request.method,
        )
        return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(
        request: Request, exc: RequestValidationError
    ):
        logger.warning(
            "Request validation failed",
            errors=exc.errors(),
            path=str(request.url),
            method=request.method,
        )

        errors = clean_errors(exc.errors())
        return JSONResponse(
            status_code=422,
            content={"detail": errors},
        )

    @app.exception_handler(PydanticValidationError)
    async def pydantic_validation_exception_handler(
        request: Request, exc: PydanticValidationError
    ):
        logger.warning(
            "Pydantic validation failed",
            errors=exc.errors(),
            path=str(request.url),
            method=request.method,
        )

        errors = clean_errors(exc.errors())
        return JSONResponse(
            status_code=422,
            content={"detail": errors},
        )

    @app.exception_handler(RateLimitExceeded)
    async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
        logger.warning(
            "Rate limit exceeded",
            path=str(request.url),
            method=request.method,
            detail=exc.detail,
        )

        return JSONResponse(
            status_code=429,
            content={"detail": "Too many requests. Try again later."},
        )

    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        logger.exception(
            "Unexpected server error",
            error=str(exc),
            path=str(request.url),
            method=request.method,
            exc_info=True,
        )
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal server error"},
        )
