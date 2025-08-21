from rest_framework_mongoengine import serializers
from .models import Job
class JobSerializer(serializers.DocumentSerializer):
    class Meta:
        model = Job
        fields = '__all__'
