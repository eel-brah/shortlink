from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.analytics import UrlClick
from app.models.user import User
from ..db.base import Base

from datetime import datetime


class Url(Base):
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
    user_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id"), nullable=True, index=True
    )
    user: Mapped[User | None] = relationship(User, backref="urls")
    clicks: Mapped[list[UrlClick]] = relationship(
        UrlClick, backref="url", lazy="selectin"
    )
