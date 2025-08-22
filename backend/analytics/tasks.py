from celery import shared_task
from datetime import datetime, timedelta
from django.utils import timezone
from .models import DailyMetrics, JobPerformance, UserActivity, SystemHealth
from accounts.models import User
from jobs.models import Job
from applications.models import Application

@shared_task
def collect_daily_metrics():
    """Collecte les métriques quotidiennes automatiquement"""
    today = timezone.now().date()
    
    # Vérifier si on a déjà collecté pour aujourd'hui
    if DailyMetrics.objects(date__gte=today).first():
        return "Métriques déjà collectées pour aujourd'hui"
    
    # Collecter les métriques
    total_users = User.objects.count()
    total_jobs = Job.objects.count()
    total_applications = Application.objects.count()
    
    # Nouvelles entrées aujourd'hui
    new_users = User.objects(created_at__gte=today).count()
    new_jobs = Job.objects(created_at__gte=today).count()
    new_applications = Application.objects(created_at__gte=today).count()
    
    # Répartition des candidatures par statut
    statuses = ['received', 'reviewing', 'shortlisted', 'rejected', 'hired']
    applications_by_status = {s: Application.objects(status=s).count() for s in statuses}
    
    # Performance
    avg_score = Application.objects.average('score') or 0.0
    total_hired = applications_by_status.get('hired', 0)
    conversion_rate = (total_hired / total_applications * 100) if total_applications > 0 else 0
    
    # Créer l'enregistrement
    DailyMetrics(
        date=today,
        total_users=total_users,
        total_jobs=total_jobs,
        total_applications=total_applications,
        new_users=new_users,
        new_jobs=new_jobs,
        new_applications=new_applications,
        applications_by_status=applications_by_status,
        avg_score=avg_score,
        conversion_rate=conversion_rate
    ).save()
    
    return f"Métriques collectées pour {today}"

@shared_task
def update_job_performance():
    """Met à jour les performances des postes"""
    for job in Job.objects.all():
        applications = Application.objects(job=job)
        total_applications = applications.count()
        
        if total_applications > 0:
            avg_score = applications.average('score') or 0.0
            hired_count = applications.filter(status='hired').count()
            conversion_rate = (hired_count / total_applications * 100) if total_applications > 0 else 0
            
            first_app = applications.order_by('created_at').first()
            last_app = applications.order_by('-created_at').first()
            
            # Mettre à jour ou créer
            JobPerformance.objects(job=job).update_one(
                upsert=True,
                set__title=job.title,
                set__department=job.department,
                set__total_applications=total_applications,
                set__avg_score=avg_score,
                set__conversion_rate=conversion_rate,
                set__first_application=first_app.created_at if first_app else None,
                set__last_application=last_app.created_at if last_app else None
            )
    
    return "Performances des postes mises à jour"

@shared_task
def update_user_activity():
    """Met à jour l'activité des utilisateurs"""
    for user in User.objects.all():
        if user.role == 'candidate':
            applications = Application.objects(candidate=user)
            total_applications = applications.count()
            avg_score = applications.average('score') or 0.0
        else:
            total_applications = 0
            avg_score = 0.0
        
        if user.role == 'recruiter':
            jobs_posted = Job.objects(recruiter=user).count()
        else:
            jobs_posted = 0
        
        # Mettre à jour ou créer
        UserActivity.objects(user=user).update_one(
            upsert=True,
            set__role=user.role,
            set__last_login=user.last_login if hasattr(user, 'last_login') else None,
            set__applications_created=total_applications,
            set__jobs_posted=jobs_posted,
            set__avg_score=avg_score,
            set__total_applications=total_applications
        )
    
    return "Activité des utilisateurs mise à jour"

@shared_task
def collect_system_health():
    """Collecte la santé du système"""
    # Métriques de base
    active_users = User.objects(is_active=True).count()
    concurrent_jobs = Job.objects(status='open').count()
    
    # Calculer le taux d'erreur (simulé pour l'instant)
    error_rate = 0.0  # À implémenter avec un vrai monitoring
    
    # Performance de la DB (simulé)
    db_performance = 100.0  # À implémenter avec de vrais métriques
    
    SystemHealth(
        timestamp=timezone.now(),
        response_time_avg=0.0,  # À implémenter
        error_rate=error_rate,
        db_connections=0,  # À implémenter
        db_performance=db_performance,
        active_users=active_users,
        concurrent_jobs=concurrent_jobs
    ).save()
    
    return "Santé du système collectée"

@shared_task
def cleanup_old_metrics():
    """Nettoie les anciennes métriques (garde 90 jours)"""
    cutoff_date = timezone.now() - timedelta(days=90)
    
    # Supprimer les anciennes métriques
    deleted_daily = DailyMetrics.objects(date__lt=cutoff_date).delete()
    deleted_health = SystemHealth.objects(timestamp__lt=cutoff_date).delete()
    
    return f"Nettoyage terminé: {deleted_daily} métriques quotidiennes, {deleted_health} métriques de santé supprimées"
