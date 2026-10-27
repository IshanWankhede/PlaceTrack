from typing import Optional
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.skill import Skill
from app.schemas.skill import SkillCreate, SkillUpdate


def get_skill(db: Session, skill_id: int) -> Optional[Skill]:
    return db.get(Skill, skill_id)


def get_skill_by_name(db: Session, name: str) -> Optional[Skill]:
    stmt = select(Skill).where(Skill.name.ilike(name.strip()))
    return db.execute(stmt).scalar_one_or_none()


def list_skills(db: Session) -> list[Skill]:
    stmt = select(Skill).order_by(Skill.name)
    return list(db.execute(stmt).scalars().all())


def create_skill(db: Session, obj_in: SkillCreate) -> Skill:
    skill = Skill(name=obj_in.name.strip())
    db.add(skill)
    db.commit()
    db.refresh(skill)
    return skill


def update_skill(db: Session, db_obj: Skill, obj_in: SkillUpdate) -> Skill:
    db_obj.name = obj_in.name.strip()
    db.commit()
    db.refresh(db_obj)
    return db_obj


def delete_skill(db: Session, db_obj: Skill) -> None:
    db.delete(db_obj)
    db.commit()
