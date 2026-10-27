from typing import TYPE_CHECKING, Optional
from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.database import Base

if TYPE_CHECKING:
    from app.models.job import Job
    from app.models.offer import Offer
    from app.models.placement import Placement


class Company(Base):
    __tablename__ = "companies"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(150), unique=True, nullable=False)
    industry: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    location: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    website: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    tier: Mapped[str] = mapped_column(String(20), nullable=False, default="CORE")
    logo_url: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # Relationships
    contacts: Mapped[list["CompanyContact"]] = relationship(
        "CompanyContact", back_populates="company", cascade="all, delete-orphan"
    )
    jobs: Mapped[list["Job"]] = relationship("Job", back_populates="company")
    offers: Mapped[list["Offer"]] = relationship("Offer", back_populates="company")
    placements: Mapped[list["Placement"]] = relationship("Placement", back_populates="company")


class CompanyContact(Base):
    __tablename__ = "company_contacts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    company_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    designation: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    email: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)

    # Relationships
    company: Mapped["Company"] = relationship("Company", back_populates="contacts")
