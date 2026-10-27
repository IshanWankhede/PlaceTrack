from datetime import datetime, time
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, ConfigDict, field_validator


VALID_ROUND_TYPES = {"ONLINE_TEST", "TECHNICAL", "HR", "GROUP_DISCUSSION"}
VALID_RESULTS = {"CLEARED", "REJECTED", "PENDING", "ABSENT"}
VALID_STATUSES = {"APPLIED", "SHORTLISTED", "INTERVIEW", "SELECTED", "REJECTED", "WITHDRAWN"}


class ApplicationCreate(BaseModel):
    job_id: int
    student_id: Optional[int] = None


class ApplicationStatusUpdate(BaseModel):
    status: str

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        s = v.upper().strip()
        if s not in VALID_STATUSES:
            raise ValueError(f"Status must be one of: {', '.join(sorted(VALID_STATUSES))}")
        return s


class ApplicationBulkStatus(BaseModel):
    job_id: int
    from_status: str
    to_status: str
    department_id: Optional[int] = None
    min_cgpa: Optional[Decimal] = None

    @field_validator("from_status", "to_status")
    @classmethod
    def validate_statuses(cls, v: str) -> str:
        s = v.upper().strip()
        if s not in VALID_STATUSES:
            raise ValueError(f"Status must be one of: {', '.join(sorted(VALID_STATUSES))}")
        return s


class ApplicationBulkStatusOut(BaseModel):
    updated_count: int
    message: str


class InterviewCreate(BaseModel):
    round_type: str = "TECHNICAL"
    scheduled_at: datetime
    meeting_link: Optional[str] = None
    venue: Optional[str] = None
    panelists: Optional[str] = None
    reporting_time: Optional[time] = None

    @field_validator("round_type")
    @classmethod
    def validate_round_type(cls, v: str) -> str:
        r = v.upper().strip()
        if r not in VALID_ROUND_TYPES:
            raise ValueError(f"round_type must be one of: {', '.join(sorted(VALID_ROUND_TYPES))}")
        return r


class InterviewResultUpdate(BaseModel):
    result: str
    remarks: Optional[str] = None

    @field_validator("result")
    @classmethod
    def validate_result(cls, v: str) -> str:
        r = v.upper().strip()
        if r not in VALID_RESULTS:
            raise ValueError(f"result must be one of: {', '.join(sorted(VALID_RESULTS))}")
        return r


class InterviewOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    application_id: int
    round_number: int
    round_type: str
    scheduled_at: Optional[datetime] = None
    result: str
    remarks: Optional[str] = None
    reporting_time: Optional[time] = None
    venue: Optional[str] = None
    meeting_link: Optional[str] = None
    panelists: Optional[str] = None


class ApplicationOverviewOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    application_id: int
    student_name: str
    roll_number: str
    company: str
    job_title: str
    status: str
    applied_at: datetime
    interview_rounds: int = 0
    student_id: Optional[int] = None
    job_id: Optional[int] = None
    company_id: Optional[int] = None


class MyApplicationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    application_id: int
    job_id: int
    # job_title is what the view/query provides; alias `title` for compatibility
    job_title: str
    title: Optional[str] = None           # same as job_title, added for frontend compat
    company: Optional[str] = None
    tier: Optional[str] = None
    package: Optional[Decimal] = None
    location: Optional[str] = None
    status: str
    applied_at: datetime
    applied_date: Optional[str] = None    # ISO date string, derived from applied_at
    interview_rounds: int = 0
    interviews: list[InterviewOut] = []


class ApplicationStatusHistoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    application_id: int
    old_status: Optional[str] = None
    new_status: str
    changed_by: str
    changed_at: datetime
