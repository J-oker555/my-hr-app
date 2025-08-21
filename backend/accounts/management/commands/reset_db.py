from django.core.management.base import BaseCommand
from django.conf import settings
from mongoengine.connection import get_db


class Command(BaseCommand):
    help = "Drop all collections in the configured MongoDB database (use with caution)."

    def handle(self, *args, **options):
        db = get_db(alias="default")
        name = settings.MONGO_DB
        self.stdout.write(self.style.WARNING(f"Dropping all collections in '{name}'..."))
        for coll in db.list_collection_names():
            db.drop_collection(coll)
        self.stdout.write(self.style.SUCCESS("Database reset complete."))


