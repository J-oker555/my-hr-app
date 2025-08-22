from django.urls import path
from . import views

urlpatterns = [
    path('metrics/', views.metrics, name='analytics_metrics'),
    path('dashboard-summary/', views.dashboard_summary, name='dashboard_summary'),
]
