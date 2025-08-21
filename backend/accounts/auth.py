from rest_framework.authentication import BaseAuthentication
from rest_framework import exceptions
from .jwt_utils import decode_jwt
from .models import User

class JWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        header = request.headers.get('Authorization') or request.META.get('HTTP_AUTHORIZATION')
        if not header:
            return None

        # Tolère 'Bearer'/'bearer' et espaces superflus
        parts = header.strip().split()
        if len(parts) != 2 or parts[0].lower() != 'bearer':
            # Laisse d'autres auth backends tenter, ou renvoie None => endpoint public
            return None

        token = parts[1].strip()
        if not token:
            raise exceptions.AuthenticationFailed('Empty token')

        try:
            payload = decode_jwt(token)
        except Exception as e:
            raise exceptions.AuthenticationFailed(f'Invalid token: {e.__class__.__name__}')

        user_id = payload.get('uid')
        if not user_id:
            raise exceptions.AuthenticationFailed('Invalid token payload')

        user = User.objects(id=user_id, is_active=True).first()
        if not user:
            raise exceptions.AuthenticationFailed('User not found or inactive')

        return (user, None)
