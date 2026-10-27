from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr, field_validator


# ─── Company Contact ──────────────────────────────────────────────────────────

class ContactBase(BaseModel):
    name: str
    designation: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None


class ContactCreate(ContactBase):
    pass


class ContactUpdate(BaseModel):
    name: Optional[str] = None
    designation: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None


class ContactOut(ContactBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    company_id: int


# ─── Company ──────────────────────────────────────────────────────────────────

VALID_TIERS = {"CORE", "DREAM", "SUPER_DREAM"}


class CompanyBase(BaseModel):
    name: str
    industry: Optional[str] = None
    location: Optional[str] = None
    website: Optional[str] = None
    description: Optional[str] = None
    tier: str = "CORE"
    logo_url: Optional[str] = None

    @field_validator("tier")
    @classmethod
    def validate_tier(cls, v: str) -> str:
        v = v.upper().strip()
        if v not in VALID_TIERS:
            raise ValueError(f"tier must be one of {VALID_TIERS}")
        return v


class CompanyCreate(CompanyBase):
    pass


class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    industry: Optional[str] = None
    location: Optional[str] = None
    website: Optional[str] = None
    description: Optional[str] = None
    tier: Optional[str] = None
    logo_url: Optional[str] = None

    @field_validator("tier")
    @classmethod
    def validate_tier(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v = v.upper().strip()
        if v not in VALID_TIERS:
            raise ValueError(f"tier must be one of {VALID_TIERS}")
        return v


class CompanyOut(CompanyBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    contacts: list[ContactOut] = []


# ─── Company History (from v_company_selections + placed students) ─────────────

class PlacedStudentOut(BaseModel):
    student_id: int
    roll_number: str
    student_name: str
    department: str
    job_role: str
    package: float
    placement_date: str  # ISO date string


class CompanyHistoryOut(BaseModel):
    company_id: int
    company: str
    total_recruited: int
    avg_package: Optional[float]
    placed_students: list[PlacedStudentOut] = []
