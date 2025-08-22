from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from applications.models import Application
from accounts.models import User
from jobs.models import Job
from datetime import datetime, timedelta
from django.utils import timezone

@api_view(['GET'])
@permission_classes([AllowAny])
def metrics(request):
    """Statistiques complètes du système HR"""
    
    # === STATISTIQUES UTILISATEURS ===
    users_total = User.objects.count()
    users_active = User.objects(is_active=True).count()
    users_inactive = users_total - users_active
    
    # Répartition par rôle
    users_by_role = {
        'admin': User.objects(role='admin').count(),
        'recruiter': User.objects(role='recruiter').count(),
        'candidate': User.objects(role='candidate').count()
    }
    
    # Nouveaux utilisateurs ce mois
    current_month = timezone.now().month
    current_year = timezone.now().year
    new_users_this_month = User.objects(
        created_at__gte=datetime(current_year, current_month, 1)
    ).count()
    
    # === STATISTIQUES POSTES ===
    jobs_total = Job.objects.count()
    jobs_open = Job.objects(status='open').count()
    jobs_closed = Job.objects(status='closed').count()
    jobs_draft = Job.objects(status='draft').count()
    
    # Répartition par département
    jobs_by_department = {}
    for job in Job.objects.only('department'):
        dept = job.department or 'Non spécifié'
        jobs_by_department[dept] = jobs_by_department.get(dept, 0) + 1
    
    # Répartition par seniorité
    jobs_by_seniority = {}
    for job in Job.objects.only('seniority'):
        seniority = job.seniority or 'Non spécifié'
        jobs_by_seniority[seniority] = jobs_by_seniority.get(seniority, 0) + 1
    
    # === STATISTIQUES CANDIDATURES ===
    applications_total = Application.objects.count()
    applications_avg_score = Application.objects.average('score') or 0
    
    # Répartition par statut
    statuses = ['received', 'reviewing', 'shortlisted', 'rejected', 'hired']
    applications_by_status = {s: Application.objects(status=s).count() for s in statuses}
    
    # Candidatures ce mois
    applications_this_month = Application.objects(
        created_at__gte=datetime(current_year, current_month, 1)
    ).count()
    
    # === STATISTIQUES AVANCÉES ===
    # Taux de conversion
    total_hired = applications_by_status.get('hired', 0)
    conversion_rate = round((total_hired / applications_total * 100) if applications_total > 0 else 0, 2)
    
    # Top des postes les plus populaires
    job_applications = {}
    for app in Application.objects.only('job'):
        job_id = str(app.job.id) if app.job else 'unknown'
        job_applications[job_id] = job_applications.get(job_id, 0) + 1
    
    # Top 5 des postes avec le plus de candidatures
    top_jobs = sorted(job_applications.items(), key=lambda x: x[1], reverse=True)[:5]
    top_jobs_with_names = []
    for job_id, count in top_jobs:
        if job_id != 'unknown':
            job = Job.objects(id=job_id).first()
            if job:
                top_jobs_with_names.append({
                    'title': job.title,
                    'department': job.department,
                    'applications_count': count
                })
    
    # === MÉTRIQUES DE PERFORMANCE ===
    # Temps moyen de traitement (si on a des dates de mise à jour)
    processing_times = []
    for app in Application.objects(status__in=['shortlisted', 'rejected', 'hired']):
        if app.updated_at and app.created_at:
            delta = app.updated_at - app.created_at
            processing_times.append(delta.days)
    
    avg_processing_time = round(sum(processing_times) / len(processing_times), 1) if processing_times else 0
    
    # === RÉSUMÉ GÉNÉRAL ===
    summary = {
        'total_users': users_total,
        'total_jobs': jobs_total,
        'total_applications': applications_total,
        'conversion_rate': f"{conversion_rate}%",
        'avg_processing_time_days': avg_processing_time
    }
    
    return Response({
        'summary': summary,
        'users': {
            'total': users_total,
            'active': users_active,
            'inactive': users_inactive,
            'by_role': users_by_role,
            'new_this_month': new_users_this_month
        },
        'jobs': {
            'total': jobs_total,
            'open': jobs_open,
            'closed': jobs_closed,
            'draft': jobs_draft,
            'by_department': jobs_by_department,
            'by_seniority': jobs_by_seniority
        },
        'applications': {
            'total': applications_total,
            'avg_score': round(applications_avg_score, 2),
            'by_status': applications_by_status,
            'this_month': applications_this_month
        },
        'performance': {
            'conversion_rate': f"{conversion_rate}%",
            'avg_processing_time_days': avg_processing_time,
            'top_jobs': top_jobs_with_names
        }
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def dashboard_summary(request):
    """Résumé rapide pour le tableau de bord principal"""
    
    # Compteurs rapides
    total_users = User.objects.count()
    total_jobs = Job.objects.count()
    total_applications = Application.objects.count()
    
    # Candidatures récentes (7 derniers jours)
    week_ago = timezone.now() - timedelta(days=7)
    recent_applications = Application.objects(created_at__gte=week_ago).count()
    
    # Postes ouverts
    open_jobs = Job.objects(status='open').count()
    
    # Candidatures en attente
    pending_applications = Application.objects(status='received').count()
    
    return Response({
        'quick_stats': {
            'total_users': total_users,
            'total_jobs': total_jobs,
            'total_applications': total_applications,
            'recent_applications': recent_applications,
            'open_jobs': open_jobs,
            'pending_applications': pending_applications
        }
    })
