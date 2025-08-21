import datetime as dt
from mongoengine import Document, StringField, EmailField, DateTimeField, BooleanField, FileField
from passlib.hash import bcrypt

ROLES = ('admin', 'recruiter', 'candidate')

class User(Document):
    
    meta = {"collection": "users"}
    email = EmailField(required=True, unique=True)
    password_hash = StringField(required=True)
    full_name = StringField(required=True)
    role = StringField(choices=ROLES, default='candidate')
    is_active = BooleanField(default=True)
    created_at = DateTimeField(default=dt.datetime.utcnow)
    # CV du candidat (PDF) – optionnel
    cv_file = FileField()

    def set_password(self, raw: str): self.password_hash = bcrypt.hash(raw)
    def check_password(self, raw: str) -> bool: return bcrypt.verify(raw, self.password_hash)

    @property
    def is_authenticated(self) -> bool:
        # DRF/permissions.IsAuthenticated lit cette propriété
        return True

    @property
    def is_anonymous(self) -> bool:
        return False

    # (optionnel, pour l’admin/permissions Django si jamais)
    def get_username(self):
        return self.email

    def __str__(self):
        return f"{self.full_name} <{self.email}>"