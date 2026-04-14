from datetime import datetime, timezone
from typing import TYPE_CHECKING
from sqlalchemy import DateTime, ForeignKey, Index, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

if TYPE_CHECKING:
    from .url import Url


class UrlClick(Base):
    __tablename__ = "url_clicks"
    __table_args__ = (
        Index("idx_url_clicks_url_id_clicked_at", "url_id", "clicked_at"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    clicked_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    ip_address: Mapped[str | None] = mapped_column(String(45), nullable=True)
    user_agent: Mapped[str | None] = mapped_column(Text, nullable=True)
    referrer: Mapped[str | None] = mapped_column(Text, nullable=True)
    country: Mapped[str | None] = mapped_column(String(30), nullable=True)
    device: Mapped[str | None] = mapped_column(String(30), nullable=True)
    browser: Mapped[str | None] = mapped_column(String(30), nullable=True)
    os: Mapped[str | None] = mapped_column(String(30), nullable=True)

    url_id: Mapped[int] = mapped_column(
        ForeignKey("urls.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    url: Mapped["Url"] = relationship(
        back_populates="clicks",
    )
