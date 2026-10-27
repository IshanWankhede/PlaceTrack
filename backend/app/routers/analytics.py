import csv
import io
from typing import Optional
from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, require_roles
from app.crud import crud_analytics
from app.database.database import get_db
from app.models.user import User
from app.schemas.analytics import (
    CompanySelectionOut,
    DepartmentStatsOut,
    FunnelItem,
    PackageRangeItem,
    PlacementKPIsOut,
    TopStudentPlacementOut,
)

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/overview", response_model=PlacementKPIsOut)
def get_analytics_overview(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """Retrieve high-level placement KPIs from mv_placement_kpis."""
    return crud_analytics.get_overview_kpis(db)


@router.get("/departments", response_model=list[DepartmentStatsOut])
def get_department_analytics(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """Retrieve department placement statistics from v_department_stats."""
    return crud_analytics.get_department_stats(db)


@router.get("/companies", response_model=list[CompanySelectionOut])
def get_company_analytics(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """Retrieve company selection statistics from v_company_selections."""
    return crud_analytics.get_company_selections(db)


@router.get("/packages", response_model=list[PackageRangeItem])
def get_package_range_analytics(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """Retrieve distribution of packages across standard CTC tiers."""
    return crud_analytics.get_package_ranges(db)


@router.get("/funnel", response_model=list[FunnelItem])
def get_application_funnel(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """Retrieve application funnel conversion counts."""
    return crud_analytics.get_funnel_counts(db)


@router.get("/top-students", response_model=list[TopStudentPlacementOut])
def get_top_students(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """Retrieve top placed students ranked by package."""
    return crud_analytics.get_top_students(db, limit=limit)


@router.get("/nirf-report.csv")
def get_nirf_report_csv(
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("ADMIN", "STAFF")),
):
    """Download NIRF accreditation format CSV report."""
    rows = crud_analytics.get_nirf_report_data(db)
    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow([
        "department",
        "graduation_year",
        "total_graduating",
        "placed_students",
        "placement_percentage",
        "median_package",
        "max_package",
    ])

    for r in rows:
        writer.writerow([
            r.get("department"),
            r.get("graduation_year"),
            r.get("total_graduating"),
            r.get("placed_students"),
            str(r.get("placement_percentage") or 0),
            str(r.get("median_package") or 0),
            str(r.get("max_package") or 0),
        ])

    csv_content = output.getvalue()
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=nirf_placement_report.csv"},
    )


@router.post("/refresh")
def refresh_analytics(
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("ADMIN", "STAFF")),
):
    """Refresh the mv_placement_kpis materialized view."""
    crud_analytics.refresh_analytics_view(db)
    return {"message": "Analytics materialized view refreshed successfully"}
