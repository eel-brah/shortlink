from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.exceptions.handlers import register_exception_handlers
from app.api.routes_auth import router as auth_router
from app.api.routes_url import router as url_router
from app.api.routes_user import router as user_router
from app.core.security import SecurityHeadersMiddleware

app = FastAPI()

# app.add_middleware(
#     TrustedHostMiddleware, allowed_hosts=["example.com", "*.example.com"]
# )

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        # "http://localhost:3000",
        # "http://127.0.0.1:3000",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],  # OPTIONS
    allow_headers=["Authorization", "Content-Type"],
)
# app.add_middleware(SecurityHeadersMiddleware)

register_exception_handlers(app)

app.include_router(auth_router, prefix="/auth", tags=["Auth"])
app.include_router(user_router, prefix="/user", tags=["User"])
app.include_router(url_router, prefix="/urls", tags=["Urls"])
