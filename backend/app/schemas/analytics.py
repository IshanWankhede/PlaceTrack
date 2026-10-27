from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, ConfigDict


class PlacementKPIsOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    total_students: int
    total_placed: int
    placement_rate: Decimal
    avg_package: Optional[Decimal] = None
    highest_package: Optional[Decimal] = None
    total_companies: Optional[int] = None
    total_offers: Optional[int] = None


class DepartmentStatsOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    department_id: int
    department: str
    total_students: int
    placed_students: int
    placement_rate: Optional[Decimal] = None
    avg_package: Optional[Decimal] = None
    max_package: Optional[Decimal] = None


class CompanySelectionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    company_id: int
    company: str
    selections: int
    avg_package: Optional[Decimal] = None


class PackageRangeItem(BaseModel):
    tier_range: str
    count: int


class FunnelItem(BaseModel):
    status: str
    count: int


class TopStudentPlacementOut(BaseModel):
    student_id: int
    student_name: str
    roll_number: str
    department: str
    company: str
    job_role: str
    package: Decimal
