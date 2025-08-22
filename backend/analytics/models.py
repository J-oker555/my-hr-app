from mongoengine import Document, StringField, IntField, FloatField, DateTimeField, DictField, ListField, ReferenceField
from datetime import datetime

class DailyMetrics(Document):
    """Métriques quotidiennes pour le suivi des tendances"""
    date = DateTimeField(required=True, default=datetime.now)
    
    # Compteurs
    total_users = IntField(default=0)
    total_jobs = IntField(default=0)
    total_applications = IntField(default=0)
    
    # Nouvelles entrées
    new_users = IntField(default=0)
    new_jobs = IntField(default=0)
    new_applications = IntField(default=0)
    
    # Répartition des candidatures par statut
    applications_by_status = DictField(default={})
    
    # Performance
    avg_score = FloatField(default=0.0)
    conversion_rate = FloatField(default=0.0)
    
    meta = {
        'collection': 'daily_metrics',
        'indexes': ['date']
    }

class JobPerformance(Document):
    """Performance des postes"""
    job = ReferenceField('jobs.Job', required=True)
    title = StringField(required=True)
    department = StringField()
    
    # Statistiques
    total_applications = IntField(default=0)
    avg_score = FloatField(default=0.0)
    conversion_rate = FloatField(default=0.0)
    
    # Dates
    first_application = DateTimeField()
    last_application = DateTimeField()
    
    meta = {
        'collection': 'job_performance',
        'indexes': ['job', 'total_applications']
    }

class UserActivity(Document):
    """Activité des utilisateurs"""
    user = ReferenceField('accounts.User', required=True)
    role = StringField(required=True)
    
    # Activité
    last_login = DateTimeField()
    applications_created = IntField(default=0)
    jobs_posted = IntField(default=0)
    
    # Performance (pour les candidats)
    avg_score = FloatField(default=0.0)
    total_applications = IntField(default=0)
    
    meta = {
        'collection': 'user_activity',
        'indexes': ['user', 'role']
    }

class SystemHealth(Document):
    """Santé du système"""
    timestamp = DateTimeField(required=True, default=datetime.now)
    
    # Performance
    response_time_avg = FloatField(default=0.0)
    error_rate = FloatField(default=0.0)
    
    # Base de données
    db_connections = IntField(default=0)
    db_performance = FloatField(default=0.0)
    
    # Utilisation
    active_users = IntField(default=0)
    concurrent_jobs = IntField(default=0)
    
    meta = {
        'collection': 'system_health',
        'indexes': ['timestamp']
    }
