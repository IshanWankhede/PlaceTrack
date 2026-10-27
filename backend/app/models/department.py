from typing import TYPE_CHECKING
from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.database import Base

if TYPE_CHECKING:
    from app.models.student import Student
    from app.models.job import JobDepartment


class Department(Base):
    __tablename__ = "departments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    code: Mapped[str] = mapped_column(String(10), unique=True, nullable=False)

    # Relationships
    students: Mapped[list["Student"]] = relationship("Student", back_populates="department")
    job_departments: Mapped[list["JobDepartment"]] = relationship("JobDepartment", back_populates="department")
