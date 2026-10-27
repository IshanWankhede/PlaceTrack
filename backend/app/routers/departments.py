from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, require_roles
from app.core.errors import ConflictError, NotFoundError
from app.crud.crud_department import (
    create_department,
    delete_department,
    get_department,
    get_department_by_code,
    get_department_by_name,
    list_departments,
    update_department,
)
from app.database.database import get_db
from app.models.user import User
from app.schemas.department import DepartmentCreate, DepartmentOut, DepartmentUpdate

router = APIRouter(prefix="/departments", tags=["departments"])


@router.get("", response_model=list[DepartmentOut])
def get_departments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Lists all academic departments."""
    return list_departments(db)


@router.get("/{department_id}", response_model=DepartmentOut)
def get_department_by_id(
    department_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Fetches a department by its ID."""
    dept = get_department(db, department_id)
    if not dept:
        raise NotFoundError("Department not found")
    return dept


@router.post("", response_model=DepartmentOut, status_code=status.HTTP_201_CREATED)
def create_new_department(
    dept_in: DepartmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("ADMIN", "STAFF")),
):
    """Creates a new department (ADMIN or STAFF only)."""
    if get_department_by_code(db, dept_in.code):
        raise ConflictError(f"Department code '{dept_in.code}' already exists")
    if get_department_by_name(db, dept_in.name):
        raise ConflictError(f"Department name '{dept_in.name}' already exists")

    return create_department(db, dept_in)


@router.put("/{department_id}", response_model=DepartmentOut)
def update_existing_department(
    department_id: int,
    dept_in: DepartmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("ADMIN", "STAFF")),
):
    """Updates a department (ADMIN or STAFF only)."""
    dept = get_department(db, department_id)
    if not dept:
        raise NotFoundError("Department not found")

    if dept_in.code and dept_in.code.upper().strip() != dept.code:
        if get_department_by_code(db, dept_in.code):
            raise ConflictError(f"Department code '{dept_in.code}' already exists")

    if dept_in.name and dept_in.name.strip() != dept.name:
        if get_department_by_name(db, dept_in.name):
            raise ConflictError(f"Department name '{dept_in.name}' already exists")

    return update_department(db, dept, dept_in)


@router.delete("/{department_id}", status_code=status.HTTP_200_OK)
def remove_department(
    department_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("ADMIN", "STAFF")),
):
    """Deletes a department (ADMIN or STAFF only)."""
    dept = get_department(db, department_id)
    if not dept:
        raise NotFoundError("Department not found")

    delete_department(db, dept)
    return {"status": "ok", "message": f"Department {department_id} deleted"}
