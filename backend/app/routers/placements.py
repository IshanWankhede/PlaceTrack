import csv
from decimal import Decimal
import io
from typing import Optional
from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, require_roles
from app.core.errors import AppException, NotFoundError
from app.crud import crud_placement
from app.database.database import get_db
from app.models.user import User
from app.schemas.placement import PlacementSummaryOut

router = APIRouter(prefix="/placements", tags=["placements"])


@router.get("/mine", response_model=PlacementSummaryOut)
def get_my_placement(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("STUDENT")),
):
    """Retrieve the authenticated student's placement record."""
    if not current_user.student_id:
        raise AppException(status_code=400, detail="Student profile not linked to user account")

    record = crud_placement.get_student_placement(db, current_user.student_id)
    if not record:
        raise NotFoundError("No placement record found for your account")

    return record


@router.get("/export.csv")
def export_placements_csv(
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("ADMIN", "STAFF")),
):
    """Export all placement records as a CSV spreadsheet."""
    rows = crud_placement.get_all_placements_for_export(db)
    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow([
        "student_id",
        "roll_number",
        "student_name",
        "department",
        "company",
        "job_role",
        "package",
        "placement_date",
    ])

    for r in rows:
        writer.writerow([
            r.get("student_id"),
            r.get("roll_number"),
            r.get("student_name"),
            r.get("department"),
            r.get("company"),
            r.get("job_role"),
            str(r.get("package")),
            str(r.get("placement_date")),
        ])

    csv_content = output.getvalue()
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=placements_export.csv"},
    )


@router.get("", response_model=list[PlacementSummaryOut])
def list_placements(
    department: Optional[str] = Query(None, description="Filter by department name"),
    company: Optional[str] = Query(None, description="Filter by company name"),
    min_package: Optional[Decimal] = Query(None, description="Filter by minimum package (LPA)"),
    max_package: Optional[Decimal] = Query(None, description="Filter by maximum package (LPA)"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("ADMIN", "STAFF")),
):
    """List placement records from placement_summary view with optional filters."""
    return crud_placement.list_placements_summary(
        db,
        department=department,
        company=company,
        min_package=min_package,
        max_package=max_package,
        limit=limit,
        offset=offset,
    )
