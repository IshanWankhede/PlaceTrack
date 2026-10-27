from typing import Literal
from pydantic import BaseModel, ConfigDict, Field

ProficiencyLevel = Literal["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]


class SkillBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)


class SkillCreate(SkillBase):
    pass


class SkillUpdate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)


class SkillOut(SkillBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class StudentSkillItem(BaseModel):
    skill_id: int
    proficiency: ProficiencyLevel = "BEGINNER"


class StudentSkillOut(BaseModel):
    skill_id: int
    skill_name: str
    proficiency: str

    model_config = ConfigDict(from_attributes=True)
