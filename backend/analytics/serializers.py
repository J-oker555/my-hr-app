from rest_framework import serializers
from .models import DailyMetrics, JobPerformance, UserActivity, SystemHealth

class DailyMetricsSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyMetrics
        fields = '__all__'

class JobPerformanceSerializer(serializers.ModelSerializer):
    job_title = serializers.CharField(source='title', read_only=True)
    department_name = serializers.CharField(source='department', read_only=True)
    
    class Meta:
        model = JobPerformance
        fields = [
            'id', 'job', 'job_title', 'department_name', 'total_applications',
            'avg_score', 'conversion_rate', 'first_application', 'last_application'
        ]

class UserActivitySerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = UserActivity
        fields = [
            'id', 'user', 'user_name', 'user_email', 'role', 'last_login',
            'applications_created', 'jobs_posted', 'avg_score', 'total_applications'
        ]

class SystemHealthSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemHealth
        fields = '__all__'

# Serializers pour les métriques agrégées
class MetricsSummarySerializer(serializers.Serializer):
    total_users = serializers.IntegerField()
    total_jobs = serializers.IntegerField()
    total_applications = serializers.IntegerField()
    conversion_rate = serializers.CharField()
    avg_processing_time_days = serializers.FloatField()

class UsersMetricsSerializer(serializers.Serializer):
    total = serializers.IntegerField()
    active = serializers.IntegerField()
    inactive = serializers.IntegerField()
    by_role = serializers.DictField()
    new_this_month = serializers.IntegerField()

class JobsMetricsSerializer(serializers.Serializer):
    total = serializers.IntegerField()
    open = serializers.IntegerField()
    closed = serializers.IntegerField()
    draft = serializers.IntegerField()
    by_department = serializers.DictField()
    by_seniority = serializers.DictField()

class ApplicationsMetricsSerializer(serializers.Serializer):
    total = serializers.IntegerField()
    avg_score = serializers.FloatField()
    by_status = serializers.DictField()
    this_month = serializers.IntegerField()

class PerformanceMetricsSerializer(serializers.Serializer):
    conversion_rate = serializers.CharField()
    avg_processing_time_days = serializers.FloatField()
    top_jobs = serializers.ListField()

class DashboardSummarySerializer(serializers.Serializer):
    quick_stats = serializers.DictField()
