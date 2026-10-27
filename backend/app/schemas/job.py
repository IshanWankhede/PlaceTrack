from datetime import date, datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, ConfigDict, field_validator


VALID_JOB_TYPES = {"FULL_TIME", "INTERNSHIP", "PPO"}
VALID_STATUSES = {"OPEN", "CLOSED", "ARCHIVED"}


# ─── Embedded sub-schemas ─────────────────────────────────────────────────────

class JobSkillIn(BaseModel):
    """Skill requirement in create/update payloads."""
    skill_id: int
    required_level: str = "BEGINNER"

    @field_validator("required_level")
    @classmethod
    def validate_level(cls, v: str) -> str:
        v = v.upper().strip()
        if v not in {"BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"}:
            raise ValueError("required_level must be BEGINNER|INTERMEDIATE|ADVANCED|EXPERT")
        return v


class JobSkillOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    skill_id: int
    skill_name: str
    required_level: str


class JobDepartmentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    department_id: int
    department_name: str


# ─── Job ──────────────────────────────────────────────────────────────────────

class JobCreate(BaseModel):
    company_id: int
    title: str
    description: Optional[str] = None
    minimum_cgpa: Decimal
    package: Optional[Decimal] = None
    package_max: Optional[Decimal] = None
    max_backlogs: int = 0
    job_type: str = "FULL_TIME"
    location: Optional[str] = None
    drive_date: Optional[date] = None
    application_deadline: Optional[date] = None
    status: str = "OPEN"
    # Nested
    skills: list[JobSkillIn] = []
    department_ids: list[int] = []

    @field_validator("minimum_cgpa")
    @classmethod
    def validate_cgpa(cls, v: Decimal) -> Decimal:
        if not (0 <= v <= 10):
            raise ValueError("minimum_cgpa must be between 0 and 10")
        return v

    @field_validator("job_type")
    @classmethod
    def validate_job_type(cls, v: str) -> str:
        v = v.upper().strip()
        if v not in VALID_JOB_TYPES:
            raise ValueError(f"job_type must be one of {VALID_JOB_TYPES}")
        return v

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        v = v.upper().strip()
        if v not in VALID_STATUSES:
            raise ValueError(f"status must be one of {VALID_STATUSES}")
        return v

    @field_validator("max_backlogs")
    @classmethod
    def validate_max_backlogs(cls, v: int) -> int:
        if v < 0:
            raise ValueError("max_backlogs must be >= 0")
        return v


class JobUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    minimum_cgpa: Optional[Decimal] = None
    package: Optional[Decimal] = None
    package_max: Optional[Decimal] = None
    max_backlogs: Optional[int] = None
    job_type: Optional[str] = None
    location: Optional[str] = None
    drive_date: Optional[date] = None
    application_deadline: Optional[date] = None
    status: Optional[str] = None
    # None = don't replace; [] = clear all
    skills: Optional[list[JobSkillIn]] = None
    department_ids: Optional[list[int]] = None

    @field_validator("minimum_cgpa")
    @classmethod
    def validate_cgpa(cls, v: Optional[Decimal]) -> Optional[Decimal]:
        if v is not None and not (0 <= v <= 10):
            raise ValueError("minimum_cgpa must be between 0 and 10")
        return v

    @field_validator("job_type")
    @classmethod
    def validate_job_type(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v = v.upper().strip()
        if v not in VALID_JOB_TYPES:
            raise ValueError(f"job_type must be one of {VALID_JOB_TYPES}")
        return v

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v = v.upper().strip()
        if v not in VALID_STATUSES:
            raise ValueError(f"status must be one of {VALID_STATUSES}")
        return v


class JobOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    company_id: int
    company_name: str
    title: str
    description: Optional[str]
    minimum_cgpa: Decimal
    package: Optional[Decimal]
    package_max: Optional[Decimal]
    max_backlogs: int
    job_type: str
    location: Optional[str]
    drive_date: Optional[date]
    application_deadline: Optional[date]
    status: str
    created_at: datetime
    skills: list[JobSkillOut] = []
    departments: list[JobDepartmentOut] = []


# ─── Eligibility ──────────────────────────────────────────────────────────────

class EligibilityRow(BaseModel):
    category: str
    rule: str
    required: str
    actual: str
    passed: bool


class EligibilityCheckOut(BaseModel):
    student_id: int
    job_id: int
    eligible: bool       # all ACADEMIC rows passed
    policy_ok: bool      # POLICY row passed
    criteria: list[EligibilityRow]


class EligibleStudentOut(BaseModel):
    student_id: int
    roll_number: str
    student_name: str
    cgpa: float
    department: str
    policy_ok: bool


class EligibleJobOut(BaseModel):
    job_id: int
    title: str
    company: str
    tier: str
    package: Optional[float]
    package_max: Optional[float]
    application_deadline: Optional[date]
    match_score: float


class CloseExpiredOut(BaseModel):
    closed: int
