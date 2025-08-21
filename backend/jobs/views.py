from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import Job
from .serializers import JobSerializer
from applications.models import Application
from applications.serializers import ApplicationReadSerializer
from applications.utils import extract_text_from_bytes
from ai.service import analyze_text

class JobViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    lookup_field = "id"
    lookup_url_kwarg = "id"               # ⬅️ très important
    queryset = Job.objects
    serializer_class = JobSerializer

    def get_queryset(self):
        # Recalcule à chaque requête pour éviter d'éventuels caches
        return Job.objects.order_by("-created_at")

    @action(detail=True, methods=["post"])
    def analyze_applications(self, request, id=None):
        job = self.get_object()
        apps = list(Application.objects(job=job))  # toutes les candidatures de cette offre

        scored = []
        for app in apps:
            # 1) Récupérer le texte du CV
            cv_text = ""
            if app.cv_file:
                try:
                    data = app.cv_file.read()
                    filename = getattr(app.cv_file, "filename", "cv.pdf")
                    cv_text = extract_text_from_bytes(data, filename)
                except Exception:
                    cv_text = ""

            # 2) Analyser (embeddings + extractions)
            result = analyze_text(cv_text, job.description or "")
            app.extracted_skills = result["skills"]
            app.extracted_education = result["education"]
            app.extracted_experience = result["experience"]
            app.score = float(result["score"])
            app.recommendations = result["recommendations"]
            app.status = "reviewing"
            app.save()
            scored.append(app)

        # 3) Top 5
        top5 = sorted(scored, key=lambda a: a.score, reverse=True)[:5]
        return Response({
            "job_id": str(job.id),
            "count_analyzed": len(scored),
            "top5": ApplicationReadSerializer(top5, many=True).data
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=["get"])
    def top(self, request, id=None):
        job = self.get_object()
        apps = Application.objects(job=job).order_by("-score")[:5]
        return Response(ApplicationReadSerializer(apps, many=True).data, status=200)
