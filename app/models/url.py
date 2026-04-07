from sqlalchemy import DateTime, String
from sqlalchemy.orm import Mapped, mapped_column
from ..db.base import Base

from datetime import datetime


class URL(Base):
    __tablename__ = "urls"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    original_url: Mapped[str] = mapped_column(String, nullable=False)
    short_code: Mapped[str] = mapped_column(
        String, unique=True, index=True, nullable=True
    )
    click_count: Mapped[int] = mapped_column(default=0)
    is_active: Mapped[bool] = mapped_column(default=True, index=True)
    expires_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
