from rest_framework_mongoengine import serializers as me_serializers
from rest_framework import serializers as drf_serializers
from .models import User

class UserPublicSerializer(me_serializers.DocumentSerializer):
    class Meta:
        model = User
        fields = ('id','email','full_name','role','is_active','created_at')

class UserCreateSerializer(me_serializers.DocumentSerializer):
    password = drf_serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('id','email','full_name','role','password')

    def create(self, validated):
        u = User(
            email=validated['email'],
            full_name=validated['full_name'],
            role=validated.get('role','candidate')
        )
        u.set_password(validated['password'])
        u.save()
        return u

class UserProfileSerializer(me_serializers.DocumentSerializer):
    class Meta:
        model = User
        fields = ('id','email','full_name','role','cv_file')