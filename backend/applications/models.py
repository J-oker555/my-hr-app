from mongoengine import Document, ReferenceField, StringField, DateTimeField, FloatField, ListField, FileField
import datetime as dt
from accounts.models import User
from jobs.models import Job  # ajuste si ton modèle est ailleurs

class Application(Document):
    meta = {"collection": "applications"}

    candidate = ReferenceField(User, required=True)
    job = ReferenceField(Job, required=True)

    # Nouveau champ pour stocker le fichier CV
    cv_file = FileField()   # <--- IMPORTANT

    extracted_skills = ListField(StringField())
    extracted_education = ListField(StringField())
    extracted_experience = ListField(StringField())
    score = FloatField(default=0.0)
    recommendations = ListField(StringField())
    status = StringField(default="received")
    created_at = DateTimeField(default=dt.datetime.utcnow)
    updated_at = DateTimeField(default=dt.datetime.utcnow)

    def save(self, *args, **kwargs):
        self.updated_at = dt.datetime.utcnow()
        return super().save(*args, **kwargs)
