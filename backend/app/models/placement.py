from datetime import date
from decimal import Decimal
from typing import TYPE_CHECKING
from sqlalchemy import Date, ForeignKey, Integer, Numeric, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.database import Base

if TYPE_CHECKING:
    from app.models.student import Student
    from app.models.application import Application
    from app.models.offer import Offer
    from app.models.job import Job
    from app.models.company import Company


class Placement(Base):
    __tablename__ = "placements"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    student_id: Mapped[int] = mapped_column(Integer, ForeignKey("students.id"), unique=True, nullable=False)
    application_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("applications.id"), unique=True, nullable=False
    )
    offer_id: Mapped[int] = mapped_column(Integer, ForeignKey("offers.id"), unique=True, nullable=False)
    job_id: Mapped[int] = mapped_column(Integer, ForeignKey("jobs.id"), nullable=False)
    company_id: Mapped[int] = mapped_column(Integer, ForeignKey("companies.id"), nullable=False)
    package: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    placement_date: Mapped[date] = mapped_column(Date, nullable=False, server_default=func.current_date())

    # Relationships
    student: Mapped["Student"] = relationship("Student", back_populates="placement")
    application: Mapped["Application"] = relationship("Application", back_populates="placement")
    offer: Mapped["Offer"] = relationship("Offer", back_populates="placement")
    job: Mapped["Job"] = relationship("Job", back_populates="placements")
    company: Mapped["Company"] = relationship("Company", back_populates="placements")
