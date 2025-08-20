from datetime import datetime
from mongoengine import Document, StringField, EmailField, ReferenceField, DateTimeField
from accounts.models import User  # si import croisé pose souci, importe localement dans la vue

STATUS_CHOICES = ("pending", "queued", "sent", "failed")
CHANNEL_CHOICES = ("email",)

class Notification(Document):
    recipient = ReferenceField(User, required=False, null=True)     # optionnel
    recipient_email = EmailField(required=True)                     # obligatoire pour l’envoi
    subject = StringField(required=True, max_length=255)
    message = StringField(required=True)
    channel = StringField(choices=CHANNEL_CHOICES, default="email")
    status = StringField(choices=STATUS_CHOICES, default="pending")
    error = StringField(null=True)

    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)
    sent_at = DateTimeField(null=True)

    meta = {
        "collection": "notifications",
        "indexes": [
            "-created_at",
            "recipient_email",
            {"fields": ["status", "-created_at"]},
        ],
    }

    def touch(self):
        self.updated_at = datetime.utcnow()
