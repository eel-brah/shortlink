import logging
import sys

import structlog

from app.core.config import settings


def setup_logging():
    common_processors = [
        structlog.contextvars.merge_contextvars,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        # structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
    ]

    if settings.DEBUG:
        processors = common_processors + [structlog.dev.ConsoleRenderer(colors=True)]
    else:
        processors = common_processors + [structlog.processors.JSONRenderer()]

    structlog.configure(
        processors=processors,
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )

    handler = logging.StreamHandler(sys.stdout)

    handler.setFormatter(logging.Formatter("%(message)s"))

    root_logger = logging.getLogger()
    root_logger.handlers = [handler]
    root_logger.setLevel(logging.DEBUG if settings.DEBUG else logging.INFO)

    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)


def get_logger(name: str | None = None):
    return structlog.get_logger(name)


# class RequestIdMiddleware(BaseHTTPMiddleware):
#     async def dispatch(self, request: Request, call_next):
#         request_id = str(uuid.uuid4())
#
#         structlog.contextvars.bind_contextvars(request_id=request_id)
#
#         response = await call_next(request)
#         response.headers["X-Request-ID"] = request_id
#         return response
