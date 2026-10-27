from decimal import Decimal
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, text
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, require_roles
from app.core.errors import ForbiddenError, NotFoundError
from app.crud.crud_job import create_job, delete_job, get_job, list_jobs, update_job
from app.database.database import get_db
from app.models.job import Job
from app.models.student import Student
from app.models.user import User
from app.schemas.common import PaginatedResponse
from app.schemas.job import (
    CloseExpiredOut,
    EligibilityCheckOut,
    EligibleJobOut,
    EligibleStudentOut,
    JobCreate,
    JobOut,
    JobUpdate,
)
from app.services.eligibility import (
    eligibility_check,
    eligible_jobs,
    eligible_students,
)

router = APIRouter(prefix="/jobs", tags=["jobs"])

WRITE_ROLES = Depends(require_roles("ADMIN", "STAFF"))
STAFF_ROLES = Depends(require_roles("ADMIN", "STAFF"))


# ─── Job CRUD ─────────────────────────────────────────────────────────────────

@router.get("", response_model=PaginatedResponse[JobOut])
def list_jobs_route(
    company_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    job_type: Optional[str] = Query(None),
    tier: Optional[str] = Query(None),
    min_cgpa: Optional[Decimal] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    skip = (page - 1) * page_size
    items, total = list_jobs(
        db,
        company_id=company_id,
        status=status,
        job_type=job_type,
        tier=tier,
        min_cgpa=min_cgpa,
        skip=skip,
        limit=page_size,
    )
    return PaginatedResponse(items=items, total=total, page=page, page_size=page_size)


@router.post("", response_model=JobOut, status_code=201)
def create_job_route(
    body: JobCreate,
    db: Session = Depends(get_db),
    _: User = WRITE_ROLES,
):
    return create_job(db, body)


@router.get("/{job_id}", response_model=JobOut)
def get_job_route(
    job_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    job = get_job(db, job_id)
    if not job:
        raise NotFoundError(f"Job {job_id} not found")
    return job


@router.put("/{job_id}", response_model=JobOut)
def update_job_route(
    job_id: int,
    body: JobUpdate,
    db: Session = Depends(get_db),
    _: User = WRITE_ROLES,
):
    job = update_job(db, job_id, body)
    if not job:
        raise NotFoundError(f"Job {job_id} not found")
    return job


@router.delete("/{job_id}", status_code=204)
def delete_job_route(
    job_id: int,
    db: Session = Depends(get_db),
    _: User = WRITE_ROLES,
):
    ok = delete_job(db, job_id)
    if not ok:
        raise NotFoundError(f"Job {job_id} not found")


@router.patch("/{job_id}/archive", response_model=JobOut)
def archive_job_route(
    job_id: int,
    db: Session = Depends(get_db),
    _: User = WRITE_ROLES,
):
    # Calls sp_archive_job; trigger raises P0001 if not found
    db.execute(text("CALL sp_archive_job(:job_id)"), {"job_id": job_id})
    db.commit()
    job = get_job(db, job_id)
    if not job:
        raise NotFoundError(f"Job {job_id} not found")
    return job


# ─── Close Expired Jobs ────────────────────────────────────────────────────────

@router.post("/close-expired", response_model=CloseExpiredOut)
def close_expired_jobs_route(
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("ADMIN")),
):
    """Calls sp_close_expired_jobs(). Returns count of jobs closed."""
    # Count OPEN jobs with passed deadline before calling
    before = db.execute(
        text(
            "SELECT COUNT(*) FROM jobs WHERE status = 'OPEN' AND application_deadline < CURRENT_DATE"
        )
    ).scalar() or 0

    db.execute(text("CALL sp_close_expired_jobs()"))
    db.commit()

    return CloseExpiredOut(closed=int(before))


# ─── Eligibility Endpoints ───────────────────────────────────────────────────

@router.get("/{job_id}/eligible-students", response_model=list[EligibleStudentOut])
def eligible_students_route(
    job_id: int,
    db: Session = Depends(get_db),
    _: User = STAFF_ROLES,
):
    job = db.get(Job, job_id)
    if not job:
        raise NotFoundError(f"Job {job_id} not found")
    return eligible_students(db, job_id)


@router.get("/{job_id}/eligibility", response_model=EligibilityCheckOut)
def eligibility_check_route(
    job_id: int,
    student_id: int = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Returns the criteria-gap report for a (student, job) pair.
    STUDENT role can only check themselves.
    ADMIN/STAFF can check any student.
    """
    if current_user.role == "STUDENT":
        if current_user.student_id != student_id:
            raise ForbiddenError("Students can only check their own eligibility")

    job = db.get(Job, job_id)
    if not job:
        raise NotFoundError(f"Job {job_id} not found")

    student = db.get(Student, student_id)
    if not student:
        raise NotFoundError(f"Student {student_id} not found")

    return eligibility_check(db, student_id, job_id)
