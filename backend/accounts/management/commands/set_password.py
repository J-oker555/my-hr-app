from django.core.management.base import BaseCommand, CommandError
from accounts.models import User


class Command(BaseCommand):
    help = "Set or reset the password for a user by email. Usage: manage.py set_password <email> <password>"

    def add_arguments(self, parser):
        parser.add_argument("email", type=str)
        parser.add_argument("password", type=str)

    def handle(self, *args, **options):
        email = (options["email"] or "").strip().lower()
        password = (options["password"] or "").strip()
        if not email or not password:
            raise CommandError("Email and password are required")
        user = User.objects(email__iexact=email).first()
        if not user:
            raise CommandError(f"User not found: {email}")
        user.set_password(password)
        user.save()
        self.stdout.write(self.style.SUCCESS(f"Password updated for {email}"))


