from datetime import datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.schemas.skill import StudentSkillOut


class StudentBase(BaseModel):
    roll_number: str = Field(..., min_length=2, max_length=20)
    name: str = Field(..., min_length=1, max_length=150)
    email: EmailStr
    phone: Optional[str] = Field(None, max_length=15)
    cgpa: Decimal = Field(..., ge=0.0, le=10.0)
    graduation_year: int = Field(..., ge=2000)
    department_id: int
    active_backlogs: int = Field(0, ge=0)
    resume_url: Optional[str] = Field(None, max_length=255)
    photo_url: Optional[str] = Field(None, max_length=255)


class StudentCreate(StudentBase):
    cgpa_verified: bool = False


class StudentUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=150)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=15)
    cgpa: Optional[Decimal] = Field(None, ge=0.0, le=10.0)
    graduation_year: Optional[int] = Field(None, ge=2000)
    department_id: Optional[int] = None
    active_backlogs: Optional[int] = Field(None, ge=0)
    cgpa_verified: Optional[bool] = None
    resume_url: Optional[str] = Field(None, max_length=255)
    photo_url: Optional[str] = Field(None, max_length=255)


class StudentMeUpdate(BaseModel):
    phone: Optional[str] = Field(None, max_length=15)
    resume_url: Optional[str] = Field(None, max_length=255)
    photo_url: Optional[str] = Field(None, max_length=255)


class StudentOut(BaseModel):
    id: int
    roll_number: str
    name: str
    email: str
    phone: Optional[str] = None
    cgpa: Decimal
    graduation_year: int
    department_id: int
    department_name: Optional[str] = None
    department_code: Optional[str] = None
    active_backlogs: int
    cgpa_verified: bool
    resume_url: Optional[str] = None
    photo_url: Optional[str] = None
    placement_status: Optional[str] = None
    skills: list[StudentSkillOut] = Field(default_factory=list)
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class StudentListResponse(BaseModel):
    items: list[StudentOut]
    total: int
    page: int
    page_size: int
