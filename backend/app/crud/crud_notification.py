from typing import Optional
from sqlalchemy import select, text
from sqlalchemy.orm import Session

from app.models.notification import Notification


def list_student_notifications(
    db: Session,
    student_id: int,
    unread_only: Optional[bool] = None,
) -> list[Notification]:
    stmt = select(Notification).where(Notification.student_id == student_id)
    if unread_only is True:
        stmt = stmt.where(Notification.is_read.is_(False))
    stmt = stmt.order_by(Notification.created_at.desc(), Notification.id.desc())
    return list(db.execute(stmt).scalars().all())


def mark_notifications_read(db: Session, student_id: int) -> None:
    try:
        db.execute(
            text("CALL sp_mark_notifications_read(:student_id)"),
            {"student_id": student_id},
        )
        db.commit()
    except Exception:
        db.rollback()
        raise
