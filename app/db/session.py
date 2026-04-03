from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine 
from ..core.config import settings

engine = create_async_engine(str(settings.DATABASE_URL), echo=True)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    expire_on_commit=False,
)
