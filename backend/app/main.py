from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from uvicorn.middleware.proxy_headers import ProxyHeadersMiddleware

from app.core.limiter import limiter
from app.core.config import settings
from app.core.exceptions.handlers import register_exception_handlers
from app.api.routes_auth import router as auth_router
from app.api.routes_url import router as url_router
from app.api.routes_user import router as user_router
from app.api.routes_redirect import router as redirect_router
from app.api.routes_analytics import router as analytics_router
from app.core.logger import setup_logging
from app.core.security import SecurityHeadersMiddleware

setup_logging()


app = FastAPI(title=settings.APP_NAME)
app.state.limiter = limiter

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(ProxyHeadersMiddleware, trusted_hosts="*")
# app.add_middleware(ProxyHeadersMiddleware, trusted_hosts=["127.0.0.1"])


app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
register_exception_handlers(app)

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(auth_router, prefix="/auth", tags=["Auth"])
api_router.include_router(user_router, prefix="/user", tags=["User"])
api_router.include_router(url_router, prefix="/urls", tags=["Urls"])
api_router.include_router(analytics_router, prefix="/analytics", tags=["Analytics"])


app.include_router(api_router)
app.include_router(redirect_router, tags=["Redirect"])
