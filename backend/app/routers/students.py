import csv
from decimal import Decimal
import io
from typing import Optional
from fastapi import APIRouter, Body, Depends, Query, Response, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, require_roles
from app.core.errors import ConflictError, ForbiddenError, NotFoundError
from app.crud.crud_department import get_department
from app.crud.crud_student import (
    build_student_out,
    create_student,
    delete_student,
    get_student,
    get_student_by_email,
    get_student_by_roll,
    list_students,
    replace_student_skills,
    update_student,
    update_student_me,
    verify_student_cgpa,
)
from app.database.database import get_db
from app.models.user import User
from app.schemas.skill import StudentSkillItem
from app.schemas.student import (
    StudentCreate,
    StudentListResponse,
    StudentMeUpdate,
    StudentOut,
    StudentUpdate,
)

router = APIRouter(prefix="/students", tags=["students"])


@router.get("", response_model=StudentListResponse)
def get_students(
    department_id: Optional[int] = Query(None),
    min_cgpa: Optional[Decimal] = Query(None, ge=0.0, le=10.0),
    max_cgpa: Optional[Decimal] = Query(None, ge=0.0, le=10.0),
    graduation_year: Optional[int] = Query(None, ge=2000),
    q: Optional[str] = Query(None, description="Search name, roll, or email"),
    placement_status: Optional[str] = Query(None, description="PLACED, IN_INTERVIEW, or UNPLACED"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("ADMIN", "STAFF")),
):
    """Lists students with filtering, search, and pagination (ADMIN and STAFF only)."""
    items, total = list_students(
        db=db,
        department_id=department_id,
        min_cgpa=min_cgpa,
        max_cgpa=max_cgpa,
        graduation_year=graduation_year,
        q=q,
        placement_status=placement_status,
        page=page,
        page_size=page_size,
    )
    return StudentListResponse(items=items, total=total, page=page, page_size=page_size)


@router.get("/export.csv")
def export_students_csv(
    department_id: Optional[int] = Query(None),
    min_cgpa: Optional[Decimal] = Query(None, ge=0.0, le=10.0),
    max_cgpa: Optional[Decimal] = Query(None, ge=0.0, le=10.0),
    graduation_year: Optional[int] = Query(None, ge=2000),
    q: Optional[str] = Query(None),
    placement_status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("ADMIN", "STAFF")),
):
    """Exports filtered student list as a downloadable CSV."""
    items, _ = list_students(
        db=db,
        department_id=department_id,
        min_cgpa=min_cgpa,
        max_cgpa=max_cgpa,
        graduation_year=graduation_year,
        q=q,
        placement_status=placement_status,
        page=1,
        page_size=100000,
    )

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "ID",
        "Roll Number",
        "Name",
        "Email",
        "Phone",
        "CGPA",
        "Graduation Year",
        "Department Code",
        "Active Backlogs",
        "CGPA Verified",
        "Placement Status",
        "Skills",
    ])

    for s in items:
        skills_str = "; ".join(f"{sk.skill_name} ({sk.proficiency})" for sk in s.skills)
        writer.writerow([
            s.id,
            s.roll_number,
            s.name,
            s.email,
            s.phone or "",
            str(s.cgpa),
            s.graduation_year,
            s.department_code or "",
            s.active_backlogs,
            "YES" if s.cgpa_verified else "NO",
            s.placement_status or "UNPLACED",
            skills_str,
        ])

    csv_data = output.getvalue()
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=students.csv"},
    )


@router.get("/me", response_model=StudentOut)
def get_student_me(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Returns the profile of the logged-in student."""
    if not current_user.student_id:
        raise ForbiddenError("Only student accounts can access /students/me")

    student = get_student(db, current_user.student_id)
    if not student:
        raise NotFoundError("Student profile not found")

    return build_student_out(student)


@router.patch("/me", response_model=StudentOut)
def update_student_me_profile(
    obj_in: StudentMeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Student updates own profile contact/resume/photo details."""
    if not current_user.student_id:
        raise ForbiddenError("Only student accounts can access /students/me")

    student = get_student(db, current_user.student_id)
    if not student:
        raise NotFoundError("Student profile not found")

    updated = update_student_me(db, student, obj_in)
    return build_student_out(updated)


@router.get("/{student_id}", response_model=StudentOut)
def get_student_by_id(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Fetches a student by ID (ADMIN/STAFF or own student profile)."""
    if current_user.role == "STUDENT" and current_user.student_id != student_id:
        raise ForbiddenError("You may only view your own student record")

    student = get_student(db, student_id)
    if not student:
        raise NotFoundError("Student not found")

    return build_student_out(student)


@router.post("", response_model=StudentOut, status_code=status.HTTP_201_CREATED)
def create_new_student(
    student_in: StudentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("ADMIN", "STAFF")),
):
    """Creates a new student record (ADMIN or STAFF only)."""
    if get_student_by_roll(db, student_in.roll_number):
        raise ConflictError(f"Roll number '{student_in.roll_number}' already exists")
    if get_student_by_email(db, student_in.email):
        raise ConflictError(f"Email '{student_in.email}' already exists")
    if not get_department(db, student_in.department_id):
        raise NotFoundError(f"Department ID {student_in.department_id} not found")

    student = create_student(db, student_in)
    # Reload with relations
    reloaded = get_student(db, student.id)
    return build_student_out(reloaded or student)


@router.put("/{student_id}", response_model=StudentOut)
def update_existing_student(
    student_id: int,
    student_in: StudentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("ADMIN", "STAFF")),
):
    """Updates a student record (ADMIN or STAFF only)."""
    student = get_student(db, student_id)
    if not student:
        raise NotFoundError("Student not found")

    if student_in.roll_number and student_in.roll_number.upper().strip() != student.roll_number:
        if get_student_by_roll(db, student_in.roll_number):
            raise ConflictError(f"Roll number '{student_in.roll_number}' already exists")

    if student_in.email and student_in.email.lower().strip() != student.email:
        if get_student_by_email(db, student_in.email):
            raise ConflictError(f"Email '{student_in.email}' already exists")

    if student_in.department_id and not get_department(db, student_in.department_id):
        raise NotFoundError(f"Department ID {student_in.department_id} not found")

    updated = update_student(db, student, student_in)
    reloaded = get_student(db, updated.id)
    return build_student_out(reloaded or updated)


@router.delete("/{student_id}", status_code=status.HTTP_200_OK)
def remove_student(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("ADMIN")),
):
    """Deletes a student record (ADMIN only)."""
    student = get_student(db, student_id)
    if not student:
        raise NotFoundError("Student not found")

    delete_student(db, student)
    return {"status": "ok", "message": f"Student {student_id} deleted"}


@router.put("/{student_id}/skills", response_model=StudentOut)
def update_student_skills(
    student_id: int,
    skills_in: list[StudentSkillItem] = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Replaces the student's skill set (ADMIN, STAFF, or own student)."""
    if current_user.role == "STUDENT" and current_user.student_id != student_id:
        raise ForbiddenError("You may only modify your own skill profile")

    student = get_student(db, student_id)
    if not student:
        raise NotFoundError("Student not found")

    replace_student_skills(db, student_id, skills_in)
    reloaded = get_student(db, student_id)
    return build_student_out(reloaded or student)


@router.patch("/{student_id}/verify-cgpa", response_model=StudentOut)
def verify_cgpa_action(
    student_id: int,
    verified: bool = Query(True),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("ADMIN", "STAFF")),
):
    """Verifies or un-verifies student scorecard via sp_verify_student_cgpa."""
    student = get_student(db, student_id)
    if not student:
        raise NotFoundError("Student not found")

    verify_student_cgpa(db, student_id, verified)
    reloaded = get_student(db, student_id)
    return build_student_out(reloaded or student)
