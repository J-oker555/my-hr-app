from rest_framework_mongoengine.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from .models import Notification
from .serializers import NotificationReadSerializer, NotificationWriteSerializer
from .tasks import send_email_task

class NotificationViewSet(ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Notification.objects
    http_method_names = ["get", "post", "put", "patch", "delete", "head", "options"]  # ← optionnel

    def get_serializer_class(self):
        return NotificationWriteSerializer if self.action in ("create","update","partial_update") else NotificationReadSerializer

    def create(self, request, *args, **kwargs):
        ser = self.get_serializer(data=request.data)
        ser.is_valid(raise_exception=True)
        notif: Notification = ser.save()
        notif.status = "queued"
        notif.save()
        send_email_task.delay(str(notif.id))
        return Response(NotificationReadSerializer(notif).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"])
    def resend(self, request, *args, **kwargs):
        notif = self.get_object()
        notif.status = "queued"
        notif.error = None
        notif.save()
        send_email_task.delay(str(notif.id))
        return Response({"queued": True}, status=200)
