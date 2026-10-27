from datetime import datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, ConfigDict, field_validator


class OfferBreakdownUpdate(BaseModel):
    base_lpa: Decimal
    bonus_lpa: Decimal = Decimal("0.00")
    esop_lpa: Decimal = Decimal("0.00")

    @field_validator("base_lpa", "bonus_lpa", "esop_lpa")
    @classmethod
    def validate_positive(cls, v: Decimal) -> Decimal:
        if v < 0:
            raise ValueError("CTC component cannot be negative")
        return v


class OfferOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    offer_id: int
    student_id: int
    student_name: str
    company: str
    tier: str
    job_title: str
    base_lpa: Decimal
    bonus_lpa: Decimal
    esop_lpa: Decimal
    package: Decimal
    status: str
    released_at: datetime
    responded_at: Optional[datetime] = None
    job_id: Optional[int] = None
    company_id: Optional[int] = None
    application_id: Optional[int] = None

    # Enriched fields for frontend views
    roll_number: Optional[str] = None
    department: Optional[str] = None
    job_role: Optional[str] = None
    package_lpa: Optional[Decimal] = None
    esop_value: Optional[Decimal] = None
    joining_date: Optional[str] = None

