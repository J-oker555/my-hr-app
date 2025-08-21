from django.urls import path, include
from django.http import JsonResponse
from mongoengine.connection import get_connection


def health(_request):
    try:
        # simple ping via pymongo
        conn = get_connection(alias="default")
        conn.admin.command("ping")
        return JsonResponse({"status": "ok"})
    except Exception as e:
        return JsonResponse({"status": "error", "detail": str(e)}, status=500)

urlpatterns = [
    path("api/accounts/", include("accounts.urls")),
    path("api/jobs/", include("jobs.urls")),
    path("api/applications/", include("applications.urls")),
    path("api/notifications/", include("notifications.urls")),  
    path("api/analytics/", include("analytics.urls")),
    path("api/health/", health),
]
