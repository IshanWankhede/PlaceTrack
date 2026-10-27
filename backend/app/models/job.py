from datetime import date, datetime
from decimal import Decimal
from typing import TYPE_CHECKING, Optional
from sqlalchemy import Date, DateTime, ForeignKey, Integer, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.database import Base

if TYPE_CHECKING:
    from app.models.company import Company
    from app.models.department import Department
    from app.models.skill import Skill
    from app.models.application import Application
    from app.models.offer import Offer
    from app.models.placement import Placement


class Job(Base):
    __tablename__ = "jobs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    company_id: Mapped[int] = mapped_column(Integer, ForeignKey("companies.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(150), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    minimum_cgpa: Mapped[Decimal] = mapped_column(Numeric(3, 2), nullable=False)
    package: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2), nullable=True)
    package_max: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2), nullable=True)
    max_backlogs: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    job_type: Mapped[str] = mapped_column(String(20), nullable=False, default="FULL_TIME")
    location: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    drive_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    application_deadline: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="OPEN")
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=func.now())

    # Relationships
    company: Mapped["Company"] = relationship("Company", back_populates="jobs")
    job_skills: Mapped[list["JobSkill"]] = relationship(
        "JobSkill", back_populates="job", cascade="all, delete-orphan"
    )
    job_departments: Mapped[list["JobDepartment"]] = relationship(
        "JobDepartment", back_populates="job", cascade="all, delete-orphan"
    )
    applications: Mapped[list["Application"]] = relationship("Application", back_populates="job")
    offers: Mapped[list["Offer"]] = relationship("Offer", back_populates="job")
    placements: Mapped[list["Placement"]] = relationship("Placement", back_populates="job")


class JobSkill(Base):
    __tablename__ = "job_skills"

    job_id: Mapped[int] = mapped_column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), primary_key=True)
    skill_id: Mapped[int] = mapped_column(Integer, ForeignKey("skills.id", ondelete="CASCADE"), primary_key=True)
    required_level: Mapped[str] = mapped_column(String(20), nullable=False, default="BEGINNER")

    # Relationships
    job: Mapped["Job"] = relationship("Job", back_populates="job_skills")
    skill: Mapped["Skill"] = relationship("Skill", back_populates="job_skills")


class JobDepartment(Base):
    __tablename__ = "job_departments"

    job_id: Mapped[int] = mapped_column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), primary_key=True)
    department_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("departments.id", ondelete="CASCADE"), primary_key=True
    )

    # Relationships
    job: Mapped["Job"] = relationship("Job", back_populates="job_departments")
    department: Mapped["Department"] = relationship("Department", back_populates="job_departments")
