import datetime as dt
import jwt
from django.conf import settings

def create_jwt(payload: dict) -> str:
    now = dt.datetime.utcnow()
    exp = now + dt.timedelta(minutes=settings.JWT_EXPIRE_MIN)
    to_encode = {
        **payload,
        "iat": int(now.timestamp()),       # iat normal
        # NE PAS mettre 'nbf' pour éviter ImmatureSignature sur machines décalées
        "exp": int(exp.timestamp()),
    }
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGO)

def decode_jwt(token: str) -> dict:
    # Validation souple : pas d'exigence iat/nbf ; 5 min de leeway
    return jwt.decode(
        token,
        settings.JWT_SECRET,
        algorithms=[settings.JWT_ALGO],
        options={
            "require": ["exp"],
            "verify_exp": True,
            "verify_nbf": False,
            "verify_iat": False,
        },
        leeway=3000,  # 5 minutes
    )
