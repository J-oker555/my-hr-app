import os
from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "hrms_backend.settings")

app = Celery("hrms_backend")
app.config_from_object("django.conf:settings", namespace="CELERY")
# autodécouverte des tasks.py dans les apps
app.autodiscover_tasks(["ai", "notifications", "applications"])
