from rest_framework_mongoengine.viewsets import ModelViewSet
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import Application
from .serializers import ApplicationWriteSerializer, ApplicationReadSerializer

class ApplicationViewSet(ModelViewSet):
    permission_classes = [AllowAny]
    queryset = Application.objects

    def get_serializer_class(self):
        return ApplicationWriteSerializer if self.action in ("create","update","partial_update") else ApplicationReadSerializer

    def perform_create(self, serializer):
        app = serializer.save()
        file_obj = self.request.FILES.get("cv_file")  # ⬅️ clé form-data
        if file_obj:
            data = file_obj.read()             # lire une seule fois
            filename = getattr(file_obj, "name", "cv")
            # éviter GridFSError “already has a file”
            app.cv_file.replace(data, filename=filename)
            app.save()
