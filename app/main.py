from fastapi import FastAPI

from app.core.exceptions.handlers import register_exception_handlers
from .api.routes import router

app = FastAPI()


register_exception_handlers(app)

app.include_router(router)
