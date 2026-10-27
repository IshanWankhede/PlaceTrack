from typing import Callable, Optional
from fastapi import Depends, Header, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.errors import ForbiddenError, UnauthorizedError
from app.core.security import decode_access_token
from app.database.database import get_db
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.api_v1_prefix}/auth/login",
    auto_error=False,
)


def get_current_user(
    db: Session = Depends(get_db),
    token: Optional[str] = Depends(oauth2_scheme),
    authorization: Optional[str] = Header(None),
) -> User:
    """Extracts and validates the current user from the Bearer token."""
    jwt_token = token
    if not jwt_token and authorization:
        parts = authorization.split()
        if len(parts) == 2 and parts[0].lower() == "bearer":
            jwt_token = parts[1]

    if not jwt_token:
        raise UnauthorizedError("Not authenticated")

    payload = decode_access_token(jwt_token)
    if not payload:
        raise UnauthorizedError("Invalid or expired token")

    subject = payload.get("sub")
    if not subject:
        raise UnauthorizedError("Token missing subject")

    # Subject can be user ID or email; try by ID first if integer-like, else email
    stmt = None
    if str(subject).isdigit():
        stmt = select(User).where(User.id == int(subject))
    else:
        stmt = select(User).where(User.email == str(subject).lower().strip())

    user = db.execute(stmt).scalar_one_or_none()
    if not user:
        raise UnauthorizedError("User no longer exists")

    if not user.is_active:
        raise ForbiddenError("User account is disabled")

    return user


def require_roles(*roles: str | list[str] | tuple[str, ...]) -> Callable[[User], User]:
    """Dependency factory checking that the current user possesses one of the allowed roles."""
    flat_roles = set()
    for r in roles:
        if isinstance(r, (list, tuple, set)):
            flat_roles.update(r)
        else:
            flat_roles.add(r)

    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in flat_roles:
            raise ForbiddenError(f"Forbidden: requires role in {sorted(flat_roles)}")
        return current_user

    return role_checker
