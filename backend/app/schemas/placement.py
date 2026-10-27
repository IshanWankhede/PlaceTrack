from datetime import date
from decimal import Decimal
from pydantic import BaseModel, ConfigDict


class PlacementSummaryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    student_id: int
    roll_number: str
    student_name: str
    department: str
    company: str
    job_role: str
    package: Decimal
    placement_date: date
