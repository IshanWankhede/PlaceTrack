"""
Eligibility service — thin wrappers over SQL functions.
All business logic lives in PostgreSQL (fn_eligible_students, fn_eligible_jobs,
fn_eligibility_check). We just call them via SQLAlchemy text() and return typed rows.
"""
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.schemas.job import (
    EligibilityCheckOut,
    EligibilityRow,
    EligibleJobOut,
    EligibleStudentOut,
)


def eligible_students(db: Session, job_id: int) -> list[EligibleStudentOut]:
    """Calls fn_eligible_students(:job_id) — returns students eligible for the job."""
    rows = db.execute(
        text("SELECT * FROM fn_eligible_students(:job_id)"),
        {"job_id": job_id},
    ).mappings().all()
    return [
        EligibleStudentOut(
            student_id=r["student_id"],
            roll_number=r["roll_number"],
            student_name=r["student_name"],
            cgpa=float(r["cgpa"]),
            department=r["department"],
            policy_ok=bool(r["policy_ok"]),
        )
        for r in rows
    ]


def eligible_jobs(db: Session, student_id: int) -> list[EligibleJobOut]:
    """Calls fn_eligible_jobs(:student_id) — returns OPEN eligible jobs sorted by match score."""
    rows = db.execute(
        text("SELECT * FROM fn_eligible_jobs(:student_id)"),
        {"student_id": student_id},
    ).mappings().all()
    return [
        EligibleJobOut(
            job_id=r["job_id"],
            title=r["title"],
            company=r["company"],
            tier=r["tier"],
            package=float(r["package"]) if r["package"] is not None else None,
            package_max=float(r["package_max"]) if r["package_max"] is not None else None,
            application_deadline=r["application_deadline"],
            match_score=float(r["match_score"]),
        )
        for r in rows
    ]


def eligibility_check(db: Session, student_id: int, job_id: int) -> EligibilityCheckOut:
    """
    Calls fn_eligibility_check(:student_id, :job_id).
    Returns the criteria-gap checklist plus summary booleans.
    eligible = all ACADEMIC rows passed.
    policy_ok = the POLICY row passed.
    """
    rows = db.execute(
        text("SELECT * FROM fn_eligibility_check(:student_id, :job_id)"),
        {"student_id": student_id, "job_id": job_id},
    ).mappings().all()

    criteria = [
        EligibilityRow(
            category=r["category"],
            rule=r["rule"],
            required=r["required"],
            actual=r["actual"],
            passed=bool(r["passed"]),
        )
        for r in rows
    ]

    academic_rows = [c for c in criteria if c.category == "ACADEMIC"]
    policy_rows = [c for c in criteria if c.category == "POLICY"]

    eligible = bool(academic_rows) and all(c.passed for c in academic_rows)
    policy_ok = bool(policy_rows) and all(c.passed for c in policy_rows)

    return EligibilityCheckOut(
        student_id=student_id,
        job_id=job_id,
        eligible=eligible,
        policy_ok=policy_ok,
        criteria=criteria,
    )
