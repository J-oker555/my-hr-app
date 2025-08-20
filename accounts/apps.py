from django.apps import AppConfig
from django.conf import settings
from mongoengine import connect
import certifi

class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.AutoField'
    name = 'accounts'

    def ready(self):
        connect(
            db=settings.MONGO_DB,
            host=settings.MONGO_URI,
            alias='default',
            tls=True,
            tlsCAFile=certifi.where(),   # <-- important sur macOS
        )
