from rest_framework_mongoengine import serializers as me_serializers
from .models import Notification

class NotificationReadSerializer(me_serializers.DocumentSerializer):
    class Meta:
        model = Notification
        fields = (
            "id", "recipient", "recipient_email",
            "subject", "message", "channel", "status",
            "error", "created_at", "updated_at", "sent_at"
        )
        read_only_fields = fields

class NotificationWriteSerializer(me_serializers.DocumentSerializer):
    class Meta:
        model = Notification
        fields = ("recipient", "recipient_email", "subject", "message", "channel")
