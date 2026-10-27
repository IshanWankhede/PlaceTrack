from decimal import Decimal
from typing import Optional
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.models.offer import Offer


def get_offer(db: Session, offer_id: int) -> Optional[Offer]:
    return db.get(Offer, offer_id)


def get_offer_overview(db: Session, offer_id: int) -> Optional[dict]:
    query = text("""
        SELECT
            o.id            AS offer_id,
            s.id            AS student_id,
            s.name          AS student_name,
            s.roll_number   AS roll_number,
            d.name          AS department,
            c.name          AS company,
            c.tier,
            j.title         AS job_title,
            j.title         AS job_role,
            o.base_lpa,
            o.bonus_lpa,
            o.esop_lpa,
            o.package,
            o.package       AS package_lpa,
            o.esop_lpa      AS esop_value,
            o.status,
            o.released_at,
            o.responded_at,
            o.job_id,
            o.company_id,
            o.application_id,
            NULL::text      AS joining_date
        FROM offers o
        JOIN students s ON s.id = o.student_id
        LEFT JOIN departments d ON d.id = s.department_id
        JOIN jobs j ON j.id = o.job_id
        JOIN companies c ON c.id = o.company_id
        WHERE o.id = :id
    """)
    row = db.execute(query, {"id": offer_id}).mappings().first()
    return dict(row) if row else None


def list_offers_overview(
    db: Session,
    status: Optional[str] = None,
    student_id: Optional[int] = None,
    company_id: Optional[int] = None,
    limit: int = 50,
    offset: int = 0,
) -> list[dict]:
    clauses = ["1=1"]
    params: dict = {"limit": limit, "offset": offset}

    if status:
        clauses.append("o.status = :status")
        params["status"] = status.upper().strip()
    if student_id:
        clauses.append("o.student_id = :student_id")
        params["student_id"] = student_id
    if company_id:
        clauses.append("o.company_id = :company_id")
        params["company_id"] = company_id

    where_sql = " AND ".join(clauses)
    query = text(f"""
        SELECT
            o.id            AS offer_id,
            s.id            AS student_id,
            s.name          AS student_name,
            s.roll_number   AS roll_number,
            d.name          AS department,
            c.name          AS company,
            c.tier,
            j.title         AS job_title,
            j.title         AS job_role,
            o.base_lpa,
            o.bonus_lpa,
            o.esop_lpa,
            o.package,
            o.package       AS package_lpa,
            o.esop_lpa      AS esop_value,
            o.status,
            o.released_at,
            o.responded_at,
            o.job_id,
            o.company_id,
            o.application_id,
            NULL::text      AS joining_date
        FROM offers o
        JOIN students s ON s.id = o.student_id
        LEFT JOIN departments d ON d.id = s.department_id
        JOIN jobs j ON j.id = o.job_id
        JOIN companies c ON c.id = o.company_id
        WHERE {where_sql}
        ORDER BY o.id DESC
        LIMIT :limit OFFSET :offset
    """)
    rows = db.execute(query, params).mappings().all()
    return [dict(r) for r in rows]


def set_offer_breakdown(
    db: Session,
    offer_id: int,
    base_lpa: Decimal,
    bonus_lpa: Decimal,
    esop_lpa: Decimal,
) -> dict:
    try:
        db.execute(
            text("CALL sp_set_offer_breakdown(:offer_id, :base, :bonus, :esop)"),
            {
                "offer_id": offer_id,
                "base": base_lpa,
                "bonus": bonus_lpa,
                "esop": esop_lpa,
            },
        )
        db.commit()
    except Exception:
        db.rollback()
        raise

    overview = get_offer_overview(db, offer_id)
    return overview or {}


def respond_to_offer(db: Session, offer_id: int, accept: bool) -> dict:
    try:
        db.execute(
            text("CALL sp_respond_to_offer(:offer_id, :accept)"),
            {"offer_id": offer_id, "accept": accept},
        )
        db.commit()
    except Exception:
        db.rollback()
        raise

    overview = get_offer_overview(db, offer_id)
    return overview or {}
