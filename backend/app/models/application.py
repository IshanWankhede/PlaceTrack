from datetime import datetime
from typing import TYPE_CHECKING, Optional
from sqlalchemy import DateTime, ForeignKey, Integer, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.database import Base

if TYPE_CHECKING:
    from app.models.student import Student
    from app.models.job import Job
    from app.models.interview import Interview
    from app.models.history import ApplicationStatusHistory
    from app.models.offer import Offer
    from app.models.placement import Placement


class Application(Base):
    __tablename__ = "applications"
    __table_args__ = (UniqueConstraint("student_id", "job_id"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    student_id: Mapped[int] = mapped_column(Integer, ForeignKey("students.id"), nullable=False)
    job_id: Mapped[int] = mapped_column(Integer, ForeignKey("jobs.id"), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="APPLIED")
    applied_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=func.now())

    # Relationships
    student: Mapped["Student"] = relationship("Student", back_populates="applications")
    job: Mapped["Job"] = relationship("Job", back_populates="applications")
    interviews: Mapped[list["Interview"]] = relationship(
        "Interview", back_populates="application", cascade="all, delete-orphan"
    )
    status_history: Mapped[list["ApplicationStatusHistory"]] = relationship(
        "ApplicationStatusHistory", back_populates="application", cascade="all, delete-orphan"
    )
    offer: Mapped[Optional["Offer"]] = relationship("Offer", back_populates="application", uselist=False)
    placement: Mapped[Optional["Placement"]] = relationship("Placement", back_populates="application", uselist=False)
