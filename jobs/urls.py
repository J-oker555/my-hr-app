from django.urls import path
from .views import JobViewSet

job_list = JobViewSet.as_view({"get": "list", "post": "create"})
job_detail = JobViewSet.as_view({"get": "retrieve"})
job_analyze = JobViewSet.as_view({"post": "analyze_applications"})
job_top = JobViewSet.as_view({"get": "top"})

urlpatterns = [
    path("", job_list, name="jobs-list"),
    path("<str:id>/", job_detail, name="jobs-detail"),         # lookup "id"
    path("<str:id>/analyze/", job_analyze, name="job-analyze"),# déclenche l’analyse de toutes les applications
    path("<str:id>/top/", job_top, name="job-top"),            # récupère le Top 5 (scores déjà calculés)
]
