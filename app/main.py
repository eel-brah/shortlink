from fastapi import FastAPI

from app.core.exceptions.handlers import register_exception_handlers
from app.api.routes_auth import router as auth_router
from app.api.routes_url import router as url_router
from app.api.routes_user import router as user_router

app = FastAPI()


register_exception_handlers(app)

app.include_router(auth_router, prefix="/auth")
app.include_router(user_router, prefix="/user")
app.include_router(url_router, prefix="/urls")
