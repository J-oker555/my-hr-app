from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.request import Request

from .models import Job
from .serializers import JobSerializer
from applications.models import Application
from applications.serializers import ApplicationReadSerializer
from applications.utils import extract_text_from_bytes
# from ai.service import analyze_text  # Temporairement commenté pour éviter les erreurs d'import
import datetime as dt

class JobViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    lookup_field = "id"
    lookup_url_kwarg = "id"
    queryset = Job.objects
    serializer_class = JobSerializer

    def get_queryset(self):
        """
        Filtre les jobs selon le rôle de l'utilisateur :
        - Admin : voit tous les jobs
        - Recruteur : voit seulement ses jobs
        - Candidat : voit tous les jobs ouverts
        """
        user = self.request.user
        
        # Si pas d'utilisateur connecté, retourner tous les jobs ouverts
        if not user or not hasattr(user, 'role'):
            return Job.objects.filter(status='open').order_by("-created_at")
        
        # Admin voit tout
        if user.role == 'admin':
            return Job.objects.all().order_by("-created_at")
        
        # Recruteur voit seulement ses jobs
        elif user.role == 'recruiter':
            return Job.objects.filter(recruiter=user).order_by("-created_at")
        
        # Candidat voit seulement les jobs ouverts
        else:
            return Job.objects.filter(status='open').order_by("-created_at")

    def perform_create(self, serializer):
        """
        Assigne automatiquement le recruteur connecté au job créé
        """
        user = self.request.user
        if user and user.role == 'recruiter':
            serializer.save(recruiter=user)
        else:
            # Si pas de recruteur, utiliser l'utilisateur connecté ou créer un job sans recruteur
            serializer.save(recruiter=user if user else None)

    @action(detail=True, methods=["get"])
    def applications(self, request, id=None):
        """
        Récupère les candidatures pour un job spécifique
        Seuls le recruteur propriétaire et l'admin peuvent voir les candidatures
        """
        job = self.get_object()
        user = request.user
        
        # Vérifier les permissions
        if not user or (user.role != 'admin' and (user.role != 'recruiter' or job.recruiter != user)):
            return Response({
                'error': 'Vous n\'avez pas la permission de voir les candidatures pour ce job'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Récupérer les candidatures pour ce job
        applications = Application.objects.filter(job=job).order_by("-created_at")
        
        return Response({
            'job': JobSerializer(job).data,
            'applications': ApplicationReadSerializer(applications, many=True).data,
            'total_applications': applications.count()
        })

    @action(detail=True, methods=["get"])
    def top(self, request, id=None):
        """
        Top 5 des candidatures pour un job
        Seuls le recruteur propriétaire et l'admin peuvent voir
        """
        job = self.get_object()
        user = request.user
        
        # Vérifier les permissions
        if not user or (user.role != 'admin' and (user.role != 'recruiter' or job.recruiter != user)):
            return Response({
                'error': 'Vous n\'avez pas la permission de voir les candidatures pour ce job'
            }, status=status.HTTP_403_FORBIDDEN)
        
        apps = Application.objects(job=job).order_by("-score")[:5]
        return Response(ApplicationReadSerializer(apps, many=True).data, status=200)

    @action(detail=False, methods=["get"])
    def my_jobs(self, request):
        """
        Endpoint pour que les recruteurs voient leurs jobs
        """
        user = request.user
        
        if not user or user.role != 'recruiter':
            return Response({
                'error': 'Seuls les recruteurs peuvent accéder à cette fonctionnalité'
            }, status=status.HTTP_403_FORBIDDEN)
        
        jobs = Job.objects.filter(recruiter=user).order_by("-created_at")
        
        # Ajouter le nombre de candidatures pour chaque job
        jobs_data = []
        for job in jobs:
            applications_count = Application.objects.filter(job=job).count()
            job_data = JobSerializer(job).data
            job_data['applications_count'] = applications_count
            jobs_data.append(job_data)
        
        return Response({
            'jobs': jobs_data,
            'total_jobs': len(jobs_data)
        })

    @action(detail=False, methods=["get"])
    def recruiter_stats(self, request):
        """
        Statistiques pour un recruteur (ses jobs, candidatures, etc.)
        """
        user = request.user
        
        if not user or user.role != 'recruiter':
            return Response({
                'error': 'Seuls les recruteurs peuvent accéder à cette fonctionnalité'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Jobs du recruteur
        my_jobs = Job.objects.filter(recruiter=user)
        total_jobs = my_jobs.count()
        open_jobs = my_jobs.filter(status='open').count()
        closed_jobs = my_jobs.filter(status='closed').count()
        
        # Candidatures pour ses jobs
        total_applications = Application.objects.filter(job__in=my_jobs).count()
        recent_applications = Application.objects.filter(
            job__in=my_jobs,
            created_at__gte=dt.datetime.utcnow() - dt.timedelta(days=7)
        ).count()
        
        # Top des jobs par nombre de candidatures
        top_jobs = []
        for job in my_jobs:
            app_count = Application.objects.filter(job=job).count()
            if app_count > 0:
                top_jobs.append({
                    'title': job.title,
                    'applications_count': app_count,
                    'status': job.status
                })
        
        # Trier par nombre de candidatures
        top_jobs.sort(key=lambda x: x['applications_count'], reverse=True)
        top_jobs = top_jobs[:5]
        
        return Response({
            'total_jobs': total_jobs,
            'open_jobs': open_jobs,
            'closed_jobs': closed_jobs,
            'total_applications': total_applications,
            'recent_applications': recent_applications,
            'top_jobs': top_jobs
        })
