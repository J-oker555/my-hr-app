from rest_framework_mongoengine import serializers
from .models import Application

class ApplicationWriteSerializer(serializers.DocumentSerializer):
    class Meta:
        model = Application
        fields = (
            "candidate",
            "job",
            "cv_file",    # ⬅️ IMPORTANT: correspond au champ du modèle
        )

class ApplicationReadSerializer(serializers.DocumentSerializer):
    class Meta:
        model = Application
        fields = "__all__"
