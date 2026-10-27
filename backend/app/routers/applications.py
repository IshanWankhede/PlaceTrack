from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, require_roles
from app.core.errors import AppException, NotFoundError
from app.crud import crud_application
from app.database.database import get_db
from app.models.user import User
from app.schemas.application import (
    ApplicationBulkStatus,
    ApplicationBulkStatusOut,
    ApplicationCreate,
    ApplicationOverviewOut,
    ApplicationStatusHistoryOut,
    ApplicationStatusUpdate,
    InterviewCreate,
    InterviewOut,
    InterviewResultUpdate,
    MyApplicationOut,
)

router = APIRouter(prefix="/applications", tags=["applications"])


# ─── Static / Collection endpoints (must precede /{id}) ─────────────────────

@router.post("", response_model=ApplicationOverviewOut, status_code=status.HTTP_201_CREATED)
def apply_to_job(
    body: ApplicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Apply to a job.
    STUDENT: student_id is taken from their account (supplied value is ignored).
    STAFF / ADMIN: must supply student_id in body.
    """
    if current_user.role == "STUDENT":
        if not current_user.student_id:
            raise AppException(status_code=status.HTTP_400_BAD_REQUEST, detail="Student profile not linked to user account")
        student_id = current_user.student_id
    elif current_user.role in ("ADMIN", "STAFF"):
        if not body.student_id:
            raise AppException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="student_id is required when applying on behalf of a student",
            )
        student_id = body.student_id
    else:
        raise AppException(status_code=status.HTTP_403_FORBIDDEN, detail="Role not permitted to apply")

    overview = crud_application.apply_to_job(db, student_id=student_id, job_id=body.job_id)
    return overview


@router.get("/mine", response_model=list[MyApplicationOut])
def get_my_applications(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["STUDENT"])),
):
    """Returns the authenticated student's own applications, each with interview rounds."""
    if not current_user.student_id:
        raise AppException(status_code=status.HTTP_400_BAD_REQUEST, detail="Student profile not linked")
    return crud_application.list_student_applications_with_interviews(db, current_user.student_id)


@router.post("/bulk-status", response_model=ApplicationBulkStatusOut)
def bulk_update_status(
    body: ApplicationBulkStatus,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(["ADMIN", "STAFF"])),
):
    """Bulk-update applications of a job (optionally filtered by department or min CGPA). All-or-nothing."""
    count = crud_application.bulk_update_status(
        db,
        job_id=body.job_id,
        from_status=body.from_status,
        to_status=body.to_status,
        department_id=body.department_id,
        min_cgpa=body.min_cgpa,
    )
    return ApplicationBulkStatusOut(
        updated_count=count,
        message=f"{count} application(s) moved {body.from_status} -> {body.to_status}",
    )


@router.get("", response_model=list[ApplicationOverviewOut])
def list_applications(
    status: Optional[str] = Query(None, description="Filter by application status"),
    job_id: Optional[int] = Query(None, description="Filter by job ID"),
    student_id: Optional[int] = Query(None, description="Filter by student ID"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(["ADMIN", "STAFF"])),
):
    """List applications read from v_application_overview with optional filters."""
    return crud_application.list_applications_overview(
        db,
        status=status,
        job_id=job_id,
        student_id=student_id,
        limit=limit,
        offset=offset,
    )


# ─── Parametrized /{id} endpoints ───────────────────────────────────────────

@router.patch("/{application_id}/status", response_model=ApplicationOverviewOut)
def update_application_status(
    application_id: int,
    body: ApplicationStatusUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(["ADMIN", "STAFF"])),
):
    """Update application status via sp_update_application_status. Enforces transition and offer policies."""
    app = crud_application.get_application(db, application_id)
    if not app:
        raise NotFoundError(f"Application {application_id} not found")

    return crud_application.update_application_status(db, application_id, body.status)


@router.post("/{application_id}/withdraw", response_model=ApplicationOverviewOut)
def withdraw_application(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Student withdraws their own application, or STAFF/ADMIN withdraws any application.
    Students accessing another student's application receive 404.
    """
    app = crud_application.get_application(db, application_id)
    if not app:
        raise NotFoundError("Application not found")

    if current_user.role == "STUDENT" and app.student_id != current_user.student_id:
        raise NotFoundError("Application not found")

    return crud_application.withdraw_application(db, application_id)


@router.get("/{application_id}/history", response_model=list[ApplicationStatusHistoryOut])
def get_application_history(
    application_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(["ADMIN", "STAFF"])),
):
    """Returns the audit log of status changes for an application ordered by id."""
    app = crud_application.get_application(db, application_id)
    if not app:
        raise NotFoundError(f"Application {application_id} not found")

    return crud_application.get_application_history(db, application_id)


# ─── Interview Sub-resource ──────────────────────────────────────────────────

@router.post("/{application_id}/interviews", response_model=InterviewOut, status_code=status.HTTP_201_CREATED)
def schedule_interview(
    application_id: int,
    body: InterviewCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(["ADMIN", "STAFF"])),
):
    """Schedule the next interview round for a shortlisted or in-interview application."""
    app = crud_application.get_application(db, application_id)
    if not app:
        raise NotFoundError(f"Application {application_id} not found")

    return crud_application.schedule_interview(
        db,
        application_id=application_id,
        round_type=body.round_type,
        scheduled_at=body.scheduled_at,
        meeting_link=body.meeting_link,
        venue=body.venue,
        panelists=body.panelists,
        reporting_time=body.reporting_time,
    )


@router.patch("/{application_id}/interviews/{round_number}", response_model=InterviewOut)
def record_interview_result(
    application_id: int,
    round_number: int,
    body: InterviewResultUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(["ADMIN", "STAFF"])),
):
    """Record the result of an interview round. REJECTED round rejects the application."""
    app = crud_application.get_application(db, application_id)
    if not app:
        raise NotFoundError(f"Application {application_id} not found")

    return crud_application.record_interview_result(
        db,
        application_id=application_id,
        round_number=round_number,
        result=body.result,
        remarks=body.remarks,
    )


@router.get("/{application_id}/interviews", response_model=list[InterviewOut])
def list_interviews(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List interview rounds for an application. Students can only view their own."""
    app = crud_application.get_application(db, application_id)
    if not app:
        raise NotFoundError("Application not found")

    if current_user.role == "STUDENT" and app.student_id != current_user.student_id:
        raise NotFoundError("Application not found")

    return crud_application.list_interviews(db, application_id)
