import datetime as dt
from mongoengine import Document, StringField, DateTimeField, ListField
class Job(Document):
    meta = {'collection':'jobs'}
    title = StringField(required=True)
    description = StringField()
    location = StringField()
    department = StringField()
    seniority = StringField()  # junior/mid/senior
    required_skills = ListField(StringField())
    created_at = DateTimeField(default=dt.datetime.utcnow)
    status = StringField(default='open')  # open/closed
