from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, require_roles
from app.core.errors import ConflictError, NotFoundError
from app.crud.crud_company import (
    create_company,
    create_contact,
    delete_company,
    delete_contact,
    get_company,
    get_company_by_name,
    get_contact,
    list_companies,
    list_contacts,
    update_company,
    update_contact,
)
from app.database.database import get_db
from app.models.user import User
from app.schemas.common import PaginatedResponse
from app.schemas.company import (
    CompanyCreate,
    CompanyHistoryOut,
    CompanyOut,
    CompanyUpdate,
    ContactCreate,
    ContactOut,
    ContactUpdate,
    PlacedStudentOut,
)

router = APIRouter(prefix="/companies", tags=["companies"])

WRITE_ROLES = Depends(require_roles("ADMIN", "STAFF"))


# ─── Company CRUD ─────────────────────────────────────────────────────────────

@router.get("", response_model=PaginatedResponse[CompanyOut])
def list_companies_route(
    tier: Optional[str] = Query(None),
    q: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    skip = (page - 1) * page_size
    items, total = list_companies(db, tier=tier, q=q, skip=skip, limit=page_size)
    return PaginatedResponse(items=items, total=total, page=page, page_size=page_size)


@router.post("", response_model=CompanyOut, status_code=201)
def create_company_route(
    body: CompanyCreate,
    db: Session = Depends(get_db),
    _: User = WRITE_ROLES,
):
    existing = get_company_by_name(db, body.name)
    if existing:
        raise ConflictError(f"Company '{body.name}' already exists")
    return create_company(db, body)


@router.get("/{company_id}", response_model=CompanyOut)
def get_company_route(
    company_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    company = get_company(db, company_id)
    if not company:
        raise NotFoundError(f"Company {company_id} not found")
    return company


@router.put("/{company_id}", response_model=CompanyOut)
def update_company_route(
    company_id: int,
    body: CompanyUpdate,
    db: Session = Depends(get_db),
    _: User = WRITE_ROLES,
):
    company = get_company(db, company_id)
    if not company:
        raise NotFoundError(f"Company {company_id} not found")
    if body.name:
        existing = get_company_by_name(db, body.name)
        if existing and existing.id != company_id:
            raise ConflictError(f"Company name '{body.name}' already taken")
    return update_company(db, company, body)


@router.delete("/{company_id}", status_code=204)
def delete_company_route(
    company_id: int,
    db: Session = Depends(get_db),
    _: User = WRITE_ROLES,
):
    company = get_company(db, company_id)
    if not company:
        raise NotFoundError(f"Company {company_id} not found")
    # FK error from jobs will be caught by the global IntegrityError handler -> 409
    delete_company(db, company)


# ─── HR Contacts ─────────────────────────────────────────────────────────────

@router.get("/{company_id}/contacts", response_model=list[ContactOut])
def list_contacts_route(
    company_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    company = get_company(db, company_id)
    if not company:
        raise NotFoundError(f"Company {company_id} not found")
    return list_contacts(db, company_id)


@router.post("/{company_id}/contacts", response_model=ContactOut, status_code=201)
def create_contact_route(
    company_id: int,
    body: ContactCreate,
    db: Session = Depends(get_db),
    _: User = WRITE_ROLES,
):
    company = get_company(db, company_id)
    if not company:
        raise NotFoundError(f"Company {company_id} not found")
    return create_contact(db, company_id, body)


@router.put("/{company_id}/contacts/{contact_id}", response_model=ContactOut)
def update_contact_route(
    company_id: int,
    contact_id: int,
    body: ContactUpdate,
    db: Session = Depends(get_db),
    _: User = WRITE_ROLES,
):
    company = get_company(db, company_id)
    if not company:
        raise NotFoundError(f"Company {company_id} not found")
    contact = get_contact(db, contact_id)
    if not contact or contact.company_id != company_id:
        raise NotFoundError(f"Contact {contact_id} not found for company {company_id}")
    return update_contact(db, contact, body)


@router.delete("/{company_id}/contacts/{contact_id}", status_code=204)
def delete_contact_route(
    company_id: int,
    contact_id: int,
    db: Session = Depends(get_db),
    _: User = WRITE_ROLES,
):
    company = get_company(db, company_id)
    if not company:
        raise NotFoundError(f"Company {company_id} not found")
    contact = get_contact(db, contact_id)
    if not contact or contact.company_id != company_id:
        raise NotFoundError(f"Contact {contact_id} not found for company {company_id}")
    delete_contact(db, contact)


# ─── Company History ──────────────────────────────────────────────────────────

@router.get("/{company_id}/history", response_model=CompanyHistoryOut)
def company_history_route(
    company_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    company = get_company(db, company_id)
    if not company:
        raise NotFoundError(f"Company {company_id} not found")

    # Aggregate from v_company_selections
    agg = db.execute(
        text(
            "SELECT selections, avg_package FROM v_company_selections WHERE company_id = :cid"
        ),
        {"cid": company_id},
    ).mappings().first()

    total_recruited = int(agg["selections"]) if agg else 0
    avg_package = float(agg["avg_package"]) if agg and agg["avg_package"] is not None else None

    # Placed students via placements table (placement_summary lacks company_id filter)
    placed_rows = db.execute(
        text(
            "SELECT s.id AS student_id, s.roll_number, s.name AS student_name, "
            "d.name AS department, j.title AS job_role, p.package, p.placement_date "
            "FROM placements p "
            "JOIN students s ON s.id = p.student_id "
            "JOIN departments d ON d.id = s.department_id "
            "JOIN jobs j ON j.id = p.job_id "
            "WHERE p.company_id = :cid "
            "ORDER BY p.placement_date DESC"
        ),
        {"cid": company_id},
    ).mappings().all()

    placed_students = [
        PlacedStudentOut(
            student_id=r["student_id"],
            roll_number=r["roll_number"],
            student_name=r["student_name"],
            department=r["department"],
            job_role=r["job_role"],
            package=float(r["package"]),
            placement_date=str(r["placement_date"]),
        )
        for r in placed_rows
    ]

    return CompanyHistoryOut(
        company_id=company_id,
        company=company.name,
        total_recruited=total_recruited,
        avg_package=avg_package,
        placed_students=placed_students,
    )
