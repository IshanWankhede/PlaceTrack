from decimal import Decimal
from typing import Optional
from sqlalchemy import text
from sqlalchemy.orm import Session


def get_overview_kpis(db: Session) -> dict:
    row = db.execute(text("SELECT * FROM mv_placement_kpis")).mappings().first()
    if not row or row.get("total_students") is None:
        # Fallback to direct calculation if materialized view is unpopulated
        row = db.execute(text("""
            SELECT
                (SELECT COUNT(*) FROM students)                                  AS total_students,
                (SELECT COUNT(*) FROM placements)                                AS total_placed,
                ROUND(100.0 * (SELECT COUNT(*) FROM placements)
                      / NULLIF((SELECT COUNT(*) FROM students), 0), 2)           AS placement_rate,
                (SELECT ROUND(AVG(package), 2) FROM placements)                  AS avg_package,
                (SELECT MAX(package) FROM placements)                            AS highest_package
        """)).mappings().first()

    data = dict(row) if row else {
        "total_students": 0,
        "total_placed": 0,
        "placement_rate": Decimal("0.00"),
        "avg_package": None,
        "highest_package": None,
    }

    companies_count = db.execute(text("SELECT COUNT(*) FROM companies")).scalar_one()
    offers_count = db.execute(text("SELECT COUNT(*) FROM offers")).scalar_one()
    data["total_companies"] = companies_count
    data["total_offers"] = offers_count
    return data


def get_department_stats(db: Session) -> list[dict]:
    query = text("SELECT * FROM v_department_stats ORDER BY department_id")
    rows = db.execute(query).mappings().all()
    return [dict(r) for r in rows]


def get_company_selections(db: Session) -> list[dict]:
    query = text("SELECT * FROM v_company_selections ORDER BY selections DESC, avg_package DESC")
    rows = db.execute(query).mappings().all()
    return [dict(r) for r in rows]


def get_package_ranges(db: Session) -> list[dict]:
    query = text("""
        SELECT
            CASE
                WHEN package < 6.00 THEN '< 6 LPA'
                WHEN package >= 6.00 AND package < 10.00 THEN '6 - 10 LPA'
                WHEN package >= 10.00 AND package < 15.00 THEN '10 - 15 LPA'
                ELSE '> 15 LPA'
            END AS tier_range,
            COUNT(*) AS count
        FROM placements
        GROUP BY tier_range
        ORDER BY MIN(package) ASC
    """)
    rows = db.execute(query).mappings().all()
    ranges = {r["tier_range"]: r["count"] for r in rows}
    expected = ["< 6 LPA", "6 - 10 LPA", "10 - 15 LPA", "> 15 LPA"]
    return [{"tier_range": k, "count": ranges.get(k, 0)} for k in expected]


def get_funnel_counts(db: Session) -> list[dict]:
    query = text("""
        SELECT status, COUNT(*) AS count
        FROM applications
        GROUP BY status
        ORDER BY count DESC
    """)
    rows = db.execute(query).mappings().all()
    counts = {r["status"]: r["count"] for r in rows}
    expected = ["APPLIED", "SHORTLISTED", "INTERVIEW", "SELECTED", "REJECTED", "WITHDRAWN"]
    return [{"status": k, "count": counts.get(k, 0)} for k in expected]


def get_top_students(db: Session, limit: int = 10) -> list[dict]:
    query = text("""
        SELECT student_id, student_name, roll_number, department, company, job_role, package
        FROM placement_summary
        ORDER BY package DESC, placement_date ASC
        LIMIT :limit
    """)
    rows = db.execute(query, {"limit": limit}).mappings().all()
    return [dict(r) for r in rows]


def get_nirf_report_data(db: Session) -> list[dict]:
    query = text("""
        SELECT
            d.name AS department,
            s.graduation_year,
            COUNT(DISTINCT s.id) AS total_graduating,
            COUNT(DISTINCT p.student_id) AS placed_students,
            ROUND(100.0 * COUNT(DISTINCT p.student_id) / NULLIF(COUNT(DISTINCT s.id), 0), 2) AS placement_percentage,
            PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY p.package) AS median_package,
            MAX(p.package) AS max_package
        FROM departments d
        JOIN students s ON s.department_id = d.id
        LEFT JOIN placements p ON p.student_id = s.id
        GROUP BY d.name, s.graduation_year
        ORDER BY d.name, s.graduation_year
    """)
    rows = db.execute(query).mappings().all()
    return [dict(r) for r in rows]


def refresh_analytics_view(db: Session) -> None:
    try:
        db.execute(text("CALL sp_refresh_analytics()"))
        db.commit()
    except Exception:
        db.rollback()
        raise
