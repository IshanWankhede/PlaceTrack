from typing import TYPE_CHECKING
from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.database import Base

if TYPE_CHECKING:
    from app.models.student import Student
    from app.models.job import JobSkill


class Skill(Base):
    __tablename__ = "skills"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)

    # Relationships
    student_skills: Mapped[list["StudentSkill"]] = relationship(
        "StudentSkill", back_populates="skill", cascade="all, delete-orphan"
    )
    job_skills: Mapped[list["JobSkill"]] = relationship(
        "JobSkill", back_populates="skill", cascade="all, delete-orphan"
    )


class StudentSkill(Base):
    __tablename__ = "student_skills"

    student_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("students.id", ondelete="CASCADE"), primary_key=True
    )
    skill_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("skills.id", ondelete="CASCADE"), primary_key=True
    )
    proficiency: Mapped[str] = mapped_column(
        String(20), nullable=False, default="BEGINNER"
    )

    # Relationships
    student: Mapped["Student"] = relationship("Student", back_populates="skills")
    skill: Mapped["Skill"] = relationship("Skill", back_populates="student_skills")
