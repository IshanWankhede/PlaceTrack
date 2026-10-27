from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.deps import require_roles
from app.core.errors import AppException
from app.crud import crud_notification
from app.database.database import get_db
from app.models.user import User
from app.schemas.notification import NotificationOut

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("", response_model=list[NotificationOut])
def get_my_notifications(
    unread: Optional[bool] = Query(None, description="If true, return only unread notifications"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["STUDENT"])),
):
    """Retrieve notifications for the authenticated student, newest first."""
    if not current_user.student_id:
        raise AppException(status_code=400, detail="Student profile not linked to user account")

    return crud_notification.list_student_notifications(
        db, student_id=current_user.student_id, unread_only=unread
    )


@router.post("/read-all")
def mark_all_notifications_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["STUDENT"])),
):
    """Mark all notifications of the authenticated student as read."""
    if not current_user.student_id:
        raise AppException(status_code=400, detail="Student profile not linked to user account")

    crud_notification.mark_notifications_read(db, student_id=current_user.student_id)
    return {"message": "Notifications marked as read"}
