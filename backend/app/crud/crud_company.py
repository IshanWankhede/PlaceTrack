from typing import Optional
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.company import Company, CompanyContact
from app.schemas.company import CompanyCreate, CompanyUpdate, ContactCreate, ContactUpdate


# ─── Company ──────────────────────────────────────────────────────────────────

def get_company(db: Session, company_id: int) -> Optional[Company]:
    return db.get(Company, company_id)


def get_company_by_name(db: Session, name: str) -> Optional[Company]:
    stmt = select(Company).where(Company.name == name.strip())
    return db.execute(stmt).scalar_one_or_none()


def list_companies(
    db: Session,
    tier: Optional[str] = None,
    q: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
) -> tuple[list[Company], int]:
    stmt = select(Company)
    if tier:
        stmt = stmt.where(Company.tier == tier.upper())
    if q:
        stmt = stmt.where(Company.name.ilike(f"%{q}%"))
    total = db.execute(stmt.with_only_columns(Company.id)).scalars().all()
    stmt = stmt.order_by(Company.id).offset(skip).limit(limit)
    items = list(db.execute(stmt).scalars().all())
    return items, len(total)


def create_company(db: Session, obj_in: CompanyCreate) -> Company:
    company = Company(
        name=obj_in.name.strip(),
        industry=obj_in.industry,
        location=obj_in.location,
        website=obj_in.website,
        description=obj_in.description,
        tier=obj_in.tier,
        logo_url=obj_in.logo_url,
    )
    db.add(company)
    db.commit()
    db.refresh(company)
    return company


def update_company(db: Session, db_obj: Company, obj_in: CompanyUpdate) -> Company:
    if obj_in.name is not None:
        db_obj.name = obj_in.name.strip()
    if obj_in.industry is not None:
        db_obj.industry = obj_in.industry
    if obj_in.location is not None:
        db_obj.location = obj_in.location
    if obj_in.website is not None:
        db_obj.website = obj_in.website
    if obj_in.description is not None:
        db_obj.description = obj_in.description
    if obj_in.tier is not None:
        db_obj.tier = obj_in.tier
    if obj_in.logo_url is not None:
        db_obj.logo_url = obj_in.logo_url
    db.commit()
    db.refresh(db_obj)
    return db_obj


def delete_company(db: Session, db_obj: Company) -> None:
    db.delete(db_obj)
    db.commit()


# ─── Company Contacts ─────────────────────────────────────────────────────────

def get_contact(db: Session, contact_id: int) -> Optional[CompanyContact]:
    return db.get(CompanyContact, contact_id)


def list_contacts(db: Session, company_id: int) -> list[CompanyContact]:
    stmt = select(CompanyContact).where(CompanyContact.company_id == company_id).order_by(CompanyContact.id)
    return list(db.execute(stmt).scalars().all())


def create_contact(db: Session, company_id: int, obj_in: ContactCreate) -> CompanyContact:
    contact = CompanyContact(
        company_id=company_id,
        name=obj_in.name.strip(),
        designation=obj_in.designation,
        email=obj_in.email,
        phone=obj_in.phone,
    )
    db.add(contact)
    db.commit()
    db.refresh(contact)
    return contact


def update_contact(db: Session, db_obj: CompanyContact, obj_in: ContactUpdate) -> CompanyContact:
    if obj_in.name is not None:
        db_obj.name = obj_in.name.strip()
    if obj_in.designation is not None:
        db_obj.designation = obj_in.designation
    if obj_in.email is not None:
        db_obj.email = obj_in.email
    if obj_in.phone is not None:
        db_obj.phone = obj_in.phone
    db.commit()
    db.refresh(db_obj)
    return db_obj


def delete_contact(db: Session, db_obj: CompanyContact) -> None:
    db.delete(db_obj)
    db.commit()
