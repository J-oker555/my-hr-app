from rest_framework_mongoengine import serializers
from .models import Job
from accounts.serializers import UserPublicSerializer

class JobSerializer(serializers.DocumentSerializer):
    recruiter_info = UserPublicSerializer(source='recruiter', read_only=True)
    
    class Meta:
        model = Job
        fields = (
            "id",
            "title",
            "description",
            "location",
            "department",
            "seniority",
            "required_skills",
            "recruiter",
            "recruiter_info",
            "created_at",
            "status"
        )
        read_only_fields = ("id", "created_at", "recruiter_info")
