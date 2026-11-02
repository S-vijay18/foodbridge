from sqlalchemy.orm import Session
from app.models.models import Notification, NotificationType

def create_notification(
    db: Session,
    user_id: int,
    title: str,
    message: str,
    notification_type: NotificationType,
    related_id: int = None
) -> Notification:
    try:
        notif = Notification(
            user_id=user_id,
            title=title,
            message=message,
            type=notification_type,
            related_id=related_id,
            is_read=False
        )
        db.add(notif)
        db.commit()
        db.refresh(notif)
        return notif
    except Exception as e:
        db.rollback()
        print(f"Error creating notification: {e}")
        return None

