from datetime import datetime
from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
from .models import Notification

@shared_task(name="notifications.send_email")
def send_email_task(notification_id: str):
    notif = Notification.objects(id=notification_id).first()
    if not notif:
        return {"error": "notification_not_found"}

    try:
        send_mail(
            subject=notif.subject,
            message=notif.message,
            from_email=getattr(settings, "DEFAULT_FROM_EMAIL", "no-reply@example.com"),
            recipient_list=[notif.recipient_email],
            fail_silently=False,
        )
        notif.status = "sent"
        notif.sent_at = datetime.utcnow()
        notif.error = None
        notif.touch()
        notif.save()
        return {"ok": True}
    except Exception as e:
        notif.status = "failed"
        notif.error = str(e)
        notif.touch()
        notif.save()
        return {"error": str(e)}
