import datetime as dt
from mongoengine import Document, StringField, DateTimeField, ListField, ReferenceField
from accounts.models import User

class Job(Document):
    meta = {'collection':'jobs'}
    title = StringField(required=True)
    description = StringField()
    location = StringField()
    department = StringField()
    seniority = StringField()  # junior/mid/senior
    required_skills = ListField(StringField())
    recruiter = ReferenceField(User, required=True)  # Le recruteur qui a créé le job
    created_at = DateTimeField(default=dt.datetime.utcnow)
    status = StringField(default='open')  # open/closed

    def save(self, *args, **kwargs):
        self.updated_at = dt.datetime.utcnow()
        return super().save(*args, **kwargs)
