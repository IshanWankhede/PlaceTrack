from typing import Optional
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.department import Department
from app.schemas.department import DepartmentCreate, DepartmentUpdate


def get_department(db: Session, department_id: int) -> Optional[Department]:
    return db.get(Department, department_id)


def get_department_by_code(db: Session, code: str) -> Optional[Department]:
    stmt = select(Department).where(Department.code == code.upper().strip())
    return db.execute(stmt).scalar_one_or_none()


def get_department_by_name(db: Session, name: str) -> Optional[Department]:
    stmt = select(Department).where(Department.name == name.strip())
    return db.execute(stmt).scalar_one_or_none()


def list_departments(db: Session) -> list[Department]:
    stmt = select(Department).order_by(Department.id)
    return list(db.execute(stmt).scalars().all())


def create_department(db: Session, obj_in: DepartmentCreate) -> Department:
    dept = Department(name=obj_in.name.strip(), code=obj_in.code.upper().strip())
    db.add(dept)
    db.commit()
    db.refresh(dept)
    return dept


def update_department(db: Session, db_obj: Department, obj_in: DepartmentUpdate) -> Department:
    if obj_in.name is not None:
        db_obj.name = obj_in.name.strip()
    if obj_in.code is not None:
        db_obj.code = obj_in.code.upper().strip()
    db.commit()
    db.refresh(db_obj)
    return db_obj


def delete_department(db: Session, db_obj: Department) -> None:
    db.delete(db_obj)
    db.commit()
