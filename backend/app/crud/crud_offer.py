from decimal import Decimal
from typing import Optional
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.models.offer import Offer


def get_offer(db: Session, offer_id: int) -> Optional[Offer]:
    return db.get(Offer, offer_id)


def get_offer_overview(db: Session, offer_id: int) -> Optional[dict]:
    query = text("SELECT * FROM v_offer_overview WHERE offer_id = :id")
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
        clauses.append("status = :status")
        params["status"] = status.upper().strip()
    if student_id:
        clauses.append("student_id = :student_id")
        params["student_id"] = student_id
    if company_id:
        clauses.append("company_id = :company_id")
        params["company_id"] = company_id

    where_sql = " AND ".join(clauses)
    query = text(f"""
        SELECT * FROM v_offer_overview
        WHERE {where_sql}
        ORDER BY offer_id DESC
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
