from datetime import datetime, time
from typing import TYPE_CHECKING, Optional
from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, Time, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.database import Base

if TYPE_CHECKING:
    from app.models.application import Application


class Interview(Base):
    __tablename__ = "interviews"
    __table_args__ = (UniqueConstraint("application_id", "round_number"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    application_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("applications.id", ondelete="CASCADE"), nullable=False
    )
    round_number: Mapped[int] = mapped_column(Integer, nullable=False)
    round_type: Mapped[str] = mapped_column(String(50), nullable=False, default="TECHNICAL")
    scheduled_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    result: Mapped[str] = mapped_column(String(20), nullable=False, default="PENDING")
    remarks: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    reporting_time: Mapped[Optional[time]] = mapped_column(Time, nullable=True)
    venue: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    meeting_link: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    panelists: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    application: Mapped["Application"] = relationship("Application", back_populates="interviews")
