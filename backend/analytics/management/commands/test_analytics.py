from django.core.management.base import BaseCommand
from analytics.tasks import collect_daily_metrics, update_job_performance, update_user_activity, collect_system_health
from analytics.views import metrics, dashboard_summary
from rest_framework.test import APIRequestFactory
from rest_framework.response import Response
import json

class Command(BaseCommand):
    help = 'Test des nouvelles fonctionnalités analytics'

    def add_arguments(self, parser):
        parser.add_argument(
            '--task',
            type=str,
            choices=['daily', 'jobs', 'users', 'health', 'all', 'api'],
            default='all',
            help='Quelle tâche exécuter'
        )

    def handle(self, *args, **options):
        task = options['task']
        
        if task == 'daily' or task == 'all':
            self.stdout.write("🔍 Collecte des métriques quotidiennes...")
            result = collect_daily_metrics.delay()
            self.stdout.write(f"✅ Tâche lancée: {result.id}")
        
        if task == 'jobs' or task == 'all':
            self.stdout.write("📊 Mise à jour des performances des postes...")
            result = update_job_performance.delay()
            self.stdout.write(f"✅ Tâche lancée: {result.id}")
        
        if task == 'users' or task == 'all':
            self.stdout.write("👥 Mise à jour de l'activité des utilisateurs...")
            result = update_user_activity.delay()
            self.stdout.write(f"✅ Tâche lancée: {result.id}")
        
        if task == 'health' or task == 'all':
            self.stdout.write("🏥 Collecte de la santé du système...")
            result = collect_system_health.delay()
            self.stdout.write(f"✅ Tâche lancée: {result.id}")
        
        if task == 'api' or task == 'all':
            self.stdout.write("🌐 Test des endpoints API...")
            factory = APIRequestFactory()
            
            # Test metrics
            request = factory.get('/api/analytics/metrics/')
            response = metrics(request)
            self.stdout.write(f"📈 Metrics API: {response.status_code}")
            if response.status_code == 200:
                data = response.data
                self.stdout.write(f"   - Utilisateurs: {data.get('summary', {}).get('total_users', 'N/A')}")
                self.stdout.write(f"   - Postes: {data.get('summary', {}).get('total_jobs', 'N/A')}")
                self.stdout.write(f"   - Candidatures: {data.get('summary', {}).get('total_applications', 'N/A')}")
            
            # Test dashboard summary
            request = factory.get('/api/analytics/dashboard-summary/')
            response = dashboard_summary(request)
            self.stdout.write(f"📊 Dashboard API: {response.status_code}")
            if response.status_code == 200:
                data = response.data
                self.stdout.write(f"   - Stats rapides: {len(data.get('quick_stats', {}))} métriques")
        
        self.stdout.write(self.style.SUCCESS("🎉 Test des analytics terminé !"))
