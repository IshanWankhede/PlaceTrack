from decimal import Decimal
from typing import Optional
from sqlalchemy import case, func, or_, select, text
from sqlalchemy.orm import Session, joinedload, selectinload

from app.models.application import Application
from app.models.department import Department
from app.models.placement import Placement
from app.models.skill import Skill, StudentSkill
from app.models.student import Student
from app.schemas.skill import StudentSkillItem, StudentSkillOut
from app.schemas.student import StudentCreate, StudentMeUpdate, StudentOut, StudentUpdate


def get_placement_status_expr():
    """SQL expression for student placement status."""
    return case(
        (select(1).where(Placement.student_id == Student.id).exists(), "PLACED"),
        (
            select(1)
            .where(
                (Application.student_id == Student.id)
                & (Application.status == "INTERVIEW")
            )
            .exists(),
            "IN_INTERVIEW",
        ),
        else_="UNPLACED",
    ).label("placement_status")


def build_student_out(student: Student, placement_status: Optional[str] = None) -> StudentOut:
    """Transforms a Student ORM model into a StudentOut schema."""
    if placement_status is None:
        if student.placement is not None:
            placement_status = "PLACED"
        elif any(a.status == "INTERVIEW" for a in getattr(student, "applications", [])):
            placement_status = "IN_INTERVIEW"
        else:
            placement_status = "UNPLACED"

    skills_out = [
        StudentSkillOut(
            skill_id=ss.skill_id,
            skill_name=ss.skill.name if ss.skill else "",
            proficiency=ss.proficiency,
        )
        for ss in getattr(student, "skills", [])
    ]

    return StudentOut(
        id=student.id,
        roll_number=student.roll_number,
        name=student.name,
        email=student.email,
        phone=student.phone,
        cgpa=student.cgpa,
        graduation_year=student.graduation_year,
        department_id=student.department_id,
        department_name=student.department.name if student.department else None,
        department_code=student.department.code if student.department else None,
        active_backlogs=student.active_backlogs,
        cgpa_verified=student.cgpa_verified,
        resume_url=student.resume_url,
        photo_url=student.photo_url,
        placement_status=placement_status,
        skills=skills_out,
        created_at=student.created_at,
    )


def get_student(db: Session, student_id: int) -> Optional[Student]:
    stmt = (
        select(Student)
        .options(
            joinedload(Student.department),
            selectinload(Student.skills).joinedload(StudentSkill.skill),
            selectinload(Student.applications),
            joinedload(Student.placement),
        )
        .where(Student.id == student_id)
    )
    return db.execute(stmt).scalar_one_or_none()


def get_student_by_email(db: Session, email: str) -> Optional[Student]:
    stmt = select(Student).where(Student.email == email.lower().strip())
    return db.execute(stmt).scalar_one_or_none()


def get_student_by_roll(db: Session, roll_number: str) -> Optional[Student]:
    stmt = select(Student).where(Student.roll_number == roll_number.upper().strip())
    return db.execute(stmt).scalar_one_or_none()


def list_students(
    db: Session,
    department_id: Optional[int] = None,
    min_cgpa: Optional[Decimal] = None,
    max_cgpa: Optional[Decimal] = None,
    graduation_year: Optional[int] = None,
    q: Optional[str] = None,
    placement_status: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
) -> tuple[list[StudentOut], int]:
    """Filters, paginates, and returns students with placement_status."""
    status_expr = get_placement_status_expr()

    base_query = select(Student, status_expr).select_from(Student)

    # Filters
    if department_id is not None:
        base_query = base_query.where(Student.department_id == department_id)
    if min_cgpa is not None:
        base_query = base_query.where(Student.cgpa >= min_cgpa)
    if max_cgpa is not None:
        base_query = base_query.where(Student.cgpa <= max_cgpa)
    if graduation_year is not None:
        base_query = base_query.where(Student.graduation_year == graduation_year)
    if q:
        search_pattern = f"%{q.strip()}%"
        base_query = base_query.where(
            or_(
                Student.name.ilike(search_pattern),
                Student.roll_number.ilike(search_pattern),
                Student.email.ilike(search_pattern),
            )
        )
    if placement_status:
        base_query = base_query.where(status_expr == placement_status.upper().strip())

    # Count query
    count_subquery = base_query.subquery()
    count_stmt = select(func.count()).select_from(count_subquery)
    total = db.execute(count_stmt).scalar() or 0

    # Paged query with eager loads
    offset = (page - 1) * page_size
    query = (
        base_query.options(
            joinedload(Student.department),
            selectinload(Student.skills).joinedload(StudentSkill.skill),
        )
        .order_by(Student.id)
        .offset(offset)
        .limit(page_size)
    )

    rows = db.execute(query).all()
    items = [build_student_out(row[0], placement_status=row[1]) for row in rows]
    return items, total


def create_student(db: Session, obj_in: StudentCreate) -> Student:
    student = Student(
        roll_number=obj_in.roll_number.upper().strip(),
        name=obj_in.name.strip(),
        email=obj_in.email.lower().strip(),
        phone=obj_in.phone.strip() if obj_in.phone else None,
        cgpa=obj_in.cgpa,
        graduation_year=obj_in.graduation_year,
        department_id=obj_in.department_id,
        active_backlogs=obj_in.active_backlogs,
        cgpa_verified=obj_in.cgpa_verified,
        resume_url=obj_in.resume_url,
        photo_url=obj_in.photo_url,
    )
    db.add(student)
    db.commit()
    db.refresh(student)
    return student


def update_student(db: Session, db_obj: Student, obj_in: StudentUpdate) -> Student:
    update_data = obj_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if field == "roll_number" and value is not None:
            setattr(db_obj, field, value.upper().strip())
        elif field == "email" and value is not None:
            setattr(db_obj, field, str(value).lower().strip())
        elif field == "name" and value is not None:
            setattr(db_obj, field, value.strip())
        else:
            setattr(db_obj, field, value)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def update_student_me(db: Session, db_obj: Student, obj_in: StudentMeUpdate) -> Student:
    """Updates only student-controlled profile fields."""
    update_data = obj_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def delete_student(db: Session, db_obj: Student) -> None:
    db.delete(db_obj)
    db.commit()


def replace_student_skills(db: Session, student_id: int, skill_items: list[StudentSkillItem]) -> None:
    """Replaces all skills for a student."""
    # Delete existing
    db.execute(
        select(StudentSkill)
        .where(StudentSkill.student_id == student_id)
    )
    # Direct delete query
    db.query(StudentSkill).filter(StudentSkill.student_id == student_id).delete()

    # Insert new skills
    for item in skill_items:
        ss = StudentSkill(
            student_id=student_id,
            skill_id=item.skill_id,
            proficiency=item.proficiency,
        )
        db.add(ss)
    db.commit()


def verify_student_cgpa(db: Session, student_id: int, verified: bool = True) -> None:
    """Invokes stored procedure sp_verify_student_cgpa."""
    db.execute(
        text("CALL sp_verify_student_cgpa(:student_id, :verified)"),
        {"student_id": student_id, "verified": verified},
    )
    db.commit()
