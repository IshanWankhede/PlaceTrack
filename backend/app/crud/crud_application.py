from datetime import datetime, time
from decimal import Decimal
from typing import Optional
from sqlalchemy import select, text
from sqlalchemy.orm import Session

from app.models.application import Application
from app.models.history import ApplicationStatusHistory
from app.models.interview import Interview


def get_application(db: Session, application_id: int) -> Optional[Application]:
    return db.get(Application, application_id)


def get_application_overview(db: Session, application_id: int) -> Optional[dict]:
    query = text("SELECT * FROM v_application_overview WHERE application_id = :id")
    row = db.execute(query, {"id": application_id}).mappings().first()
    return dict(row) if row else None


def list_applications_overview(
    db: Session,
    status: Optional[str] = None,
    job_id: Optional[int] = None,
    student_id: Optional[int] = None,
    limit: int = 50,
    offset: int = 0,
) -> list[dict]:
    clauses = ["1=1"]
    params: dict = {"limit": limit, "offset": offset}

    if status:
        clauses.append("status = :status")
        params["status"] = status.upper().strip()
    if job_id:
        clauses.append("job_id = :job_id")
        params["job_id"] = job_id
    if student_id:
        clauses.append("student_id = :student_id")
        params["student_id"] = student_id

    where_sql = " AND ".join(clauses)
    query = text(f"""
        SELECT * FROM v_application_overview
        WHERE {where_sql}
        ORDER BY application_id DESC
        LIMIT :limit OFFSET :offset
    """)
    rows = db.execute(query, params).mappings().all()
    return [dict(r) for r in rows]


def apply_to_job(db: Session, student_id: int, job_id: int) -> dict:
    try:
        db.execute(
            text("CALL sp_apply_to_job(:student_id, :job_id)"),
            {"student_id": student_id, "job_id": job_id},
        )
        db.commit()
    except Exception:
        db.rollback()
        raise

    query = text("""
        SELECT * FROM v_application_overview
        WHERE student_id = :student_id AND job_id = :job_id
        ORDER BY application_id DESC
        LIMIT 1
    """)
    row = db.execute(query, {"student_id": student_id, "job_id": job_id}).mappings().first()
    return dict(row) if row else {}


def update_application_status(db: Session, application_id: int, new_status: str) -> dict:
    try:
        db.execute(
            text("CALL sp_update_application_status(:application_id, :new_status)"),
            {"application_id": application_id, "new_status": new_status},
        )
        db.commit()
    except Exception:
        db.rollback()
        raise

    overview = get_application_overview(db, application_id)
    return overview or {}


def withdraw_application(db: Session, application_id: int) -> dict:
    try:
        db.execute(
            text("CALL sp_withdraw_application(:application_id)"),
            {"application_id": application_id},
        )
        db.commit()
    except Exception:
        db.rollback()
        raise

    overview = get_application_overview(db, application_id)
    return overview or {}


def get_application_history(db: Session, application_id: int) -> list[ApplicationStatusHistory]:
    stmt = (
        select(ApplicationStatusHistory)
        .where(ApplicationStatusHistory.application_id == application_id)
        .order_by(ApplicationStatusHistory.id.asc())
    )
    return list(db.execute(stmt).scalars().all())


def bulk_update_status(
    db: Session,
    job_id: int,
    from_status: str,
    to_status: str,
    department_id: Optional[int] = None,
    min_cgpa: Optional[Decimal] = None,
) -> int:
    count_query = text("""
        SELECT COUNT(*)
        FROM applications a
        JOIN students s ON s.id = a.student_id
        WHERE a.job_id = :job_id
          AND a.status = :from_status
          AND (:dept_id IS NULL OR s.department_id = :dept_id)
          AND (:min_cgpa IS NULL OR s.cgpa >= :min_cgpa)
    """)
    count = db.execute(
        count_query,
        {
            "job_id": job_id,
            "from_status": from_status,
            "dept_id": department_id,
            "min_cgpa": min_cgpa,
        },
    ).scalar_one()

    try:
        db.execute(
            text("CALL sp_bulk_update_status(:job_id, :from_status, :to_status, :dept_id, :min_cgpa)"),
            {
                "job_id": job_id,
                "from_status": from_status,
                "to_status": to_status,
                "dept_id": department_id,
                "min_cgpa": min_cgpa,
            },
        )
        db.commit()
    except Exception:
        db.rollback()
        raise

    return count


def schedule_interview(
    db: Session,
    application_id: int,
    round_type: str,
    scheduled_at: datetime,
    meeting_link: Optional[str] = None,
    venue: Optional[str] = None,
    panelists: Optional[str] = None,
    reporting_time: Optional[time] = None,
) -> Interview:
    if scheduled_at and scheduled_at.tzinfo is not None:
        scheduled_at = scheduled_at.replace(tzinfo=None)
    try:
        db.execute(
            text("""
                CALL sp_schedule_interview(
                    :application_id, :round_type, CAST(:scheduled_at AS TIMESTAMP),
                    :meeting_link, :venue, :panelists, :reporting_time
                )
            """),
            {
                "application_id": application_id,
                "round_type": round_type,
                "scheduled_at": scheduled_at,
                "meeting_link": meeting_link,
                "venue": venue,
                "panelists": panelists,
                "reporting_time": reporting_time,
            },
        )
        db.commit()
    except Exception:
        db.rollback()
        raise

    stmt = (
        select(Interview)
        .where(Interview.application_id == application_id)
        .order_by(Interview.round_number.desc())
        .limit(1)
    )
    return db.execute(stmt).scalar_one()


def record_interview_result(
    db: Session,
    application_id: int,
    round_number: int,
    result: str,
    remarks: Optional[str] = None,
) -> Interview:
    try:
        db.execute(
            text("""
                CALL sp_record_interview_result(
                    :application_id, :round_number, :result, :remarks
                )
            """),
            {
                "application_id": application_id,
                "round_number": round_number,
                "result": result,
                "remarks": remarks,
            },
        )
        db.commit()
    except Exception:
        db.rollback()
        raise

    stmt = select(Interview).where(
        Interview.application_id == application_id,
        Interview.round_number == round_number,
    )
    return db.execute(stmt).scalar_one()


def list_interviews(db: Session, application_id: int) -> list[Interview]:
    stmt = (
        select(Interview)
        .where(Interview.application_id == application_id)
        .order_by(Interview.round_number.asc())
    )
    return list(db.execute(stmt).scalars().all())


def list_student_applications_with_interviews(db: Session, student_id: int) -> list[dict]:
    query = text("""
        SELECT * FROM v_application_overview
        WHERE student_id = :student_id
        ORDER BY application_id DESC
    """)
    rows = db.execute(query, {"student_id": student_id}).mappings().all()
    results = []
    for r in rows:
        d = dict(r)
        interviews = list_interviews(db, d["application_id"])
        d["interviews"] = interviews
        results.append(d)
    return results
