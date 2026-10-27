from decimal import Decimal
from typing import Optional
from sqlalchemy import text
from sqlalchemy.orm import Session


def list_placements_summary(
    db: Session,
    department: Optional[str] = None,
    company: Optional[str] = None,
    min_package: Optional[Decimal] = None,
    max_package: Optional[Decimal] = None,
    limit: int = 50,
    offset: int = 0,
) -> list[dict]:
    clauses = ["1=1"]
    params: dict = {"limit": limit, "offset": offset}

    if department:
        clauses.append("LOWER(department) LIKE :department")
        params["department"] = f"%{department.lower().strip()}%"
    if company:
        clauses.append("LOWER(company) LIKE :company")
        params["company"] = f"%{company.lower().strip()}%"
    if min_package is not None:
        clauses.append("package >= :min_package")
        params["min_package"] = min_package
    if max_package is not None:
        clauses.append("package <= :max_package")
        params["max_package"] = max_package

    where_sql = " AND ".join(clauses)
    query = text(f"""
        SELECT * FROM placement_summary
        WHERE {where_sql}
        ORDER BY package DESC, placement_date DESC
        LIMIT :limit OFFSET :offset
    """)
    rows = db.execute(query, params).mappings().all()
    return [dict(r) for r in rows]


def get_student_placement(db: Session, student_id: int) -> Optional[dict]:
    query = text("SELECT * FROM placement_summary WHERE student_id = :student_id")
    row = db.execute(query, {"student_id": student_id}).mappings().first()
    return dict(row) if row else None


def get_all_placements_for_export(db: Session) -> list[dict]:
    query = text("SELECT * FROM placement_summary ORDER BY package DESC, placement_date DESC")
    rows = db.execute(query).mappings().all()
    return [dict(r) for r in rows]
