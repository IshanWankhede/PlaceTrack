from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.crud import crud_notification
from app.database.database import get_db
from app.models.user import User
from app.schemas.notification import NotificationOut

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("", response_model=list[NotificationOut])
def get_my_notifications(
    unread: Optional[bool] = Query(None, description="If true, return only unread notifications"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve notifications for the authenticated user, newest first. Non-students receive an empty list."""
    if not current_user.student_id:
        return []

    return crud_notification.list_student_notifications(
        db, student_id=current_user.student_id, unread_only=unread
    )


@router.post("/read-all")
def mark_all_notifications_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Mark all notifications of the authenticated user as read."""
    if not current_user.student_id:
        return {"message": "Notifications marked as read"}

    crud_notification.mark_notifications_read(db, student_id=current_user.student_id)
    return {"message": "Notifications marked as read"}

