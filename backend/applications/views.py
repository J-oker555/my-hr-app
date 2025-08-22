from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser

from .models import Application
from .serializers import ApplicationWriteSerializer, ApplicationReadSerializer
from .utils import extract_text_from_bytes
from ai.cv_analyzer import cv_analyzer

class ApplicationViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    lookup_field = "id"
    lookup_url_kwarg = "id"
    queryset = Application.objects
    serializer_class = ApplicationWriteSerializer
    parser_classes = (MultiPartParser, FormParser)

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ApplicationWriteSerializer
        return ApplicationReadSerializer

    def get_queryset(self):
        """
        Filtre les candidatures selon le rôle de l'utilisateur :
        - Admin : voit toutes les candidatures
        - Recruteur : voit seulement les candidatures pour ses jobs
        - Candidat : voit seulement ses propres candidatures
        """
        user = self.request.user
        
        # Si pas d'utilisateur connecté, retourner toutes les candidatures
        if not user or not hasattr(user, 'role'):
            return Application.objects.all().order_by("-created_at")
        
        # Admin voit tout
        if user.role == 'admin':
            return Application.objects.all().order_by("-created_at")
        
        # Recruteur voit seulement les candidatures pour ses jobs
        elif user.role == 'recruiter':
            from jobs.models import Job
            my_jobs = Job.objects.filter(recruiter=user)
            return Application.objects.filter(job__in=my_jobs).order_by("-created_at")
        
        # Candidat voit seulement ses propres candidatures
        else:
            return Application.objects.filter(candidate=user).order_by("-created_at")

    def create(self, request, *args, **kwargs):
        """
        Créer une candidature avec analyse automatique du CV
        """
        try:
            # Créer la candidature
            application = super().create(request, *args, **kwargs)
            
            # Analyser automatiquement le CV si présent
            if request.FILES.get('cv_file'):
                cv_file = request.FILES['cv_file']
                job_description = application.data['job'].description or ""
                
                # Analyser le CV
                analysis_result = cv_analyzer.analyze_cv_for_job(cv_file, job_description)
                
                if analysis_result['success']:
                    # Mettre à jour la candidature avec les résultats d'analyse
                    app_instance = Application.objects.get(id=application.data['id'])
                    
                    # Extraire les scores de compatibilité
                    compatibility = analysis_result['compatibility']
                    entities = analysis_result['entities']
                    
                    app_instance.extracted_skills = entities.get('skills', [])
                    app_instance.extracted_education = entities.get('education', [])
                    app_instance.extracted_experience = entities.get('experience', [])
                    app_instance.score = compatibility['overall_score']
                    
                    # Ajouter des recommandations basées sur le score
                    if compatibility['overall_score'] >= 80:
                        app_instance.status = 'shortlisted'
                        app_instance.recommendations = ['Candidat très compatible', 'À interviewer en priorité']
                    elif compatibility['overall_score'] >= 60:
                        app_instance.status = 'reviewing'
                        app_instance.recommendations = ['Candidat compatible', 'À examiner plus en détail']
                    else:
                        app_instance.status = 'received'
                        app_instance.recommendations = ['Compatibilité faible', 'À examiner manuellement']
                    
                    app_instance.save()
                    
                    # Retourner la réponse avec l'analyse
                    return Response({
                        'message': 'Candidature créée avec analyse automatique du CV',
                        'application': ApplicationReadSerializer(app_instance).data,
                        'cv_analysis': {
                            'compatibility_score': f"{compatibility['overall_score']}%",
                            'skills_match': f"{compatibility['skills_match']}%",
                            'experience_match': f"{compatibility['experience_match']}%",
                            'semantic_similarity': f"{compatibility['semantic_similarity']}%",
                            'extracted_skills': entities.get('skills', []),
                            'recommendations': app_instance.recommendations
                        }
                    }, status=status.HTTP_201_CREATED)
            
            return application
            
        except Exception as e:
            return Response({
                'error': f'Erreur lors de la création de la candidature: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["post"])
    def analyze_cv(self, request, id=None):
        """
        Analyser manuellement le CV d'une candidature existante
        """
        try:
            application = self.get_object()
            
            if not application.cv_file:
                return Response({
                    'error': 'Aucun CV trouvé pour cette candidature'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Analyser le CV
            job_description = application.job.description or ""
            analysis_result = cv_analyzer.analyze_cv_for_job(application.cv_file, job_description)
            
            if analysis_result['success']:
                # Mettre à jour la candidature
                compatibility = analysis_result['compatibility']
                entities = analysis_result['entities']
                
                application.extracted_skills = entities.get('skills', [])
                application.extracted_education = entities.get('education', [])
                application.extracted_experience = entities.get('experience', [])
                application.score = compatibility['overall_score']
                
                # Mettre à jour le statut basé sur le score
                if compatibility['overall_score'] >= 80:
                    application.status = 'shortlisted'
                elif compatibility['overall_score'] >= 60:
                    application.status = 'reviewing'
                
                application.save()
                
                return Response({
                    'message': 'CV analysé avec succès',
                    'compatibility_score': f"{compatibility['overall_score']}%",
                    'skills_match': f"{compatibility['skills_match']}%",
                    'experience_match': f"{compatibility['experience_match']}%",
                    'semantic_similarity': f"{compatibility['semantic_similarity']}%",
                    'extracted_skills': entities.get('skills', []),
                    'updated_status': application.status
                })
            else:
                return Response({
                    'error': analysis_result.get('error', 'Erreur lors de l\'analyse')
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            return Response({
                'error': f'Erreur lors de l\'analyse: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=["get"])
    def compatibility_stats(self, request):
        """
        Statistiques de compatibilité des candidatures
        Filtrées selon le rôle de l'utilisateur
        """
        try:
            # Utiliser le queryset filtré selon le rôle
            applications = self.get_queryset()
            
            total_apps = applications.count()
            if total_apps == 0:
                return Response({
                    'message': 'Aucune candidature trouvée',
                    'stats': {}
                })
            
            # Calculer les statistiques de compatibilité
            high_compatibility = applications.filter(score__gte=80).count()
            medium_compatibility = applications.filter(score__gte=60, score__lt=80).count()
            low_compatibility = applications.filter(score__lt=60).count()
            
            avg_score = applications.average('score') or 0
            
            # Top 5 des candidatures les plus compatibles
            top_applications = applications.order_by('-score')[:5]
            top_apps_data = []
            
            for app in top_applications:
                top_apps_data.append({
                    'candidate': app.candidate.full_name,
                    'job': app.job.title,
                    'compatibility_score': f"{app.score}%",
                    'status': app.status
                })
            
            return Response({
                'total_applications': total_apps,
                'average_compatibility': f"{avg_score:.1f}%",
                'compatibility_distribution': {
                    'high_80_100': {
                        'count': high_compatibility,
                        'percentage': f"{(high_compatibility/total_apps)*100:.1f}%"
                    },
                    'medium_60_79': {
                        'count': medium_compatibility,
                        'percentage': f"{(medium_compatibility/total_apps)*100:.1f}%"
                    },
                    'low_0_59': {
                        'count': low_compatibility,
                        'percentage': f"{(low_compatibility/total_apps)*100:.1f}%"
                    }
                },
                'top_applications': top_apps_data
            })
            
        except Exception as e:
            return Response({
                'error': f'Erreur lors du calcul des statistiques: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=["get"])
    def recruiter_applications(self, request):
        """
        Endpoint spécial pour les recruteurs : voir toutes les candidatures pour leurs jobs
        """
        user = request.user
        
        if not user or user.role != 'recruiter':
            return Response({
                'error': 'Seuls les recruteurs peuvent accéder à cette fonctionnalité'
            }, status=status.HTTP_403_FORBIDDEN)
        
        from jobs.models import Job
        my_jobs = Job.objects.filter(recruiter=user)
        applications = Application.objects.filter(job__in=my_jobs).order_by("-created_at")
        
        # Grouper par job
        applications_by_job = {}
        for app in applications:
            job_title = app.job.title
            if job_title not in applications_by_job:
                applications_by_job[job_title] = []
            applications_by_job[job_title].append(ApplicationReadSerializer(app).data)
        
        return Response({
            'total_applications': applications.count(),
            'applications_by_job': applications_by_job
        })
