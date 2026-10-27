from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING, Optional
from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.database import Base

if TYPE_CHECKING:
    from app.models.application import Application
    from app.models.student import Student
    from app.models.job import Job
    from app.models.company import Company
    from app.models.placement import Placement


class Offer(Base):
    __tablename__ = "offers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    application_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("applications.id"), unique=True, nullable=False
    )
    student_id: Mapped[int] = mapped_column(Integer, ForeignKey("students.id"), nullable=False)
    job_id: Mapped[int] = mapped_column(Integer, ForeignKey("jobs.id"), nullable=False)
    company_id: Mapped[int] = mapped_column(Integer, ForeignKey("companies.id"), nullable=False)
    base_lpa: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False, default=Decimal("0.00"))
    bonus_lpa: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False, default=Decimal("0.00"))
    esop_lpa: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False, default=Decimal("0.00"))
    package: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="PENDING")
    released_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=func.now())
    responded_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    # Relationships
    application: Mapped["Application"] = relationship("Application", back_populates="offer")
    student: Mapped["Student"] = relationship("Student", back_populates="offers")
    job: Mapped["Job"] = relationship("Job", back_populates="offers")
    company: Mapped["Company"] = relationship("Company", back_populates="offers")
    placement: Mapped[Optional["Placement"]] = relationship("Placement", back_populates="offer", uselist=False)
