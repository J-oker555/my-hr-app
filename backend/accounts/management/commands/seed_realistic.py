from django.core.management.base import BaseCommand
from accounts.models import User


SEED_USERS = [
    {"email": "admin@example.com", "full_name": "Admin User", "role": "admin", "password": "Admin123!"},
    {"email": "recruiter@example.com", "full_name": "Recruiter One", "role": "recruiter", "password": "Recruit123!"},
    {"email": "candidate@example.com", "full_name": "Candidate Test", "role": "candidate", "password": "Candidate123!"},
]


class Command(BaseCommand):
    help = "Seed database with realistic users. Safe to run multiple times."

    def handle(self, *args, **options):
        created = 0
        for u in SEED_USERS:
            existing = User.objects(email=u["email"]).first()
            if existing:
                continue
            user = User(email=u["email"], full_name=u["full_name"], role=u["role"]) 
            user.set_password(u["password"]) 
            user.save()
            created += 1
        self.stdout.write(self.style.SUCCESS(f"Seed complete. Created {created} users."))


