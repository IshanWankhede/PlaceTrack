from app.schemas.auth import (
    ForgotPasswordRequest,
    LoginRequest,
    ResetPasswordRequest,
    SignupRequestOtp,
    SignupVerify,
    TokenResponse,
    UserOut,
)
from app.schemas.common import PaginatedResponse
from app.schemas.department import (
    DepartmentBase,
    DepartmentCreate,
    DepartmentOut,
    DepartmentUpdate,
)
from app.schemas.skill import (
    SkillBase,
    SkillCreate,
    SkillOut,
    SkillUpdate,
    StudentSkillItem,
    StudentSkillOut,
)
from app.schemas.student import (
    StudentBase,
    StudentCreate,
    StudentListResponse,
    StudentMeUpdate,
    StudentOut,
    StudentUpdate,
)

__all__ = [
    "PaginatedResponse",
    "DepartmentBase",
    "DepartmentCreate",
    "DepartmentUpdate",
    "DepartmentOut",
    "SkillBase",
    "SkillCreate",
    "SkillUpdate",
    "SkillOut",
    "StudentSkillItem",
    "StudentSkillOut",
    "StudentBase",
    "StudentCreate",
    "StudentUpdate",
    "StudentMeUpdate",
    "StudentOut",
    "StudentListResponse",
    "LoginRequest",
    "TokenResponse",
    "UserOut",
    "SignupRequestOtp",
    "SignupVerify",
    "ForgotPasswordRequest",
    "ResetPasswordRequest",
]
