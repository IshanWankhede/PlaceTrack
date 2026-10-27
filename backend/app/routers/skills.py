from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, require_roles
from app.core.errors import ConflictError, NotFoundError
from app.crud.crud_skill import (
    create_skill,
    delete_skill,
    get_skill,
    get_skill_by_name,
    list_skills,
    update_skill,
)
from app.database.database import get_db
from app.models.user import User
from app.schemas.skill import SkillCreate, SkillOut, SkillUpdate

router = APIRouter(prefix="/skills", tags=["skills"])


@router.get("", response_model=list[SkillOut])
def get_skills(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Lists all skills (available to any authenticated user)."""
    return list_skills(db)


@router.get("/{skill_id}", response_model=SkillOut)
def get_skill_by_id(
    skill_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Fetches a skill by its ID."""
    skill = get_skill(db, skill_id)
    if not skill:
        raise NotFoundError("Skill not found")
    return skill


@router.post("", response_model=SkillOut, status_code=status.HTTP_201_CREATED)
def create_new_skill(
    skill_in: SkillCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("ADMIN", "STAFF")),
):
    """Creates a new skill (ADMIN or STAFF only)."""
    if get_skill_by_name(db, skill_in.name):
        raise ConflictError(f"Skill '{skill_in.name}' already exists")
    return create_skill(db, skill_in)


@router.put("/{skill_id}", response_model=SkillOut)
def update_existing_skill(
    skill_id: int,
    skill_in: SkillUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("ADMIN", "STAFF")),
):
    """Updates a skill name (ADMIN or STAFF only)."""
    skill = get_skill(db, skill_id)
    if not skill:
        raise NotFoundError("Skill not found")

    if skill_in.name.strip().lower() != skill.name.lower():
        if get_skill_by_name(db, skill_in.name):
            raise ConflictError(f"Skill '{skill_in.name}' already exists")

    return update_skill(db, skill, skill_in)


@router.delete("/{skill_id}", status_code=status.HTTP_200_OK)
def remove_skill(
    skill_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("ADMIN", "STAFF")),
):
    """Deletes a skill (ADMIN or STAFF only)."""
    skill = get_skill(db, skill_id)
    if not skill:
        raise NotFoundError("Skill not found")

    delete_skill(db, skill)
    return {"status": "ok", "message": f"Skill {skill_id} deleted"}
