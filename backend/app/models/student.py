from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING, Optional
from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.database import Base

if TYPE_CHECKING:
    from app.models.department import Department
    from app.models.user import User
    from app.models.skill import StudentSkill
    from app.models.notification import Notification
    from app.models.application import Application
    from app.models.offer import Offer
    from app.models.placement import Placement


class Student(Base):
    __tablename__ = "students"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    roll_number: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    email: Mapped[str] = mapped_column(String(150), unique=True, nullable=False)
    phone: Mapped[Optional[str]] = mapped_column(String(15), nullable=True)
    cgpa: Mapped[Decimal] = mapped_column(Numeric(3, 2), nullable=False)
    graduation_year: Mapped[int] = mapped_column(Integer, nullable=False)
    department_id: Mapped[int] = mapped_column(Integer, ForeignKey("departments.id"), nullable=False)
    active_backlogs: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    cgpa_verified: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    resume_url: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    photo_url: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=func.now())

    # Relationships
    department: Mapped["Department"] = relationship("Department", back_populates="students")
    user: Mapped[Optional["User"]] = relationship("User", back_populates="student", uselist=False)
    skills: Mapped[list["StudentSkill"]] = relationship(
        "StudentSkill", back_populates="student", cascade="all, delete-orphan"
    )
    notifications: Mapped[list["Notification"]] = relationship(
        "Notification", back_populates="student", cascade="all, delete-orphan"
    )
    applications: Mapped[list["Application"]] = relationship("Application", back_populates="student")
    offers: Mapped[list["Offer"]] = relationship("Offer", back_populates="student")
    placement: Mapped[Optional["Placement"]] = relationship("Placement", back_populates="student", uselist=False)
