from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status, viewsets
from .models import User
from rest_framework.permissions import AllowAny , IsAuthenticated
from .serializers import UserPublicSerializer, UserCreateSerializer
from .jwt_utils import create_jwt
from .permissions import IsAdmin

@api_view(['POST'])
@permission_classes([AllowAny]) 
def register(request):
    # Normaliser l'email côté serveur
    if 'email' in request.data and isinstance(request.data['email'], str):
        request.data['email'] = request.data['email'].strip().lower()
    ser = UserCreateSerializer(data=request.data)
    ser.is_valid(raise_exception=True)
    user = ser.save()
    token = create_jwt({'uid': str(user.id), 'role': user.role})
    return Response({'token': token, 'user': UserPublicSerializer(user).data}, status=201)

@api_view(['POST'])
@permission_classes([AllowAny]) 
def login(request):
    email = (request.data.get('email') or '').strip().lower()
    password = (request.data.get('password') or '').strip()
    if not email or not password:
        return Response({'detail': 'Email and password are required'}, status=400)
    user = User.objects(email__iexact=email, is_active=True).first()
    if not user:
        return Response({'detail': 'email_not_found'}, status=400)
    if not user.check_password(password):
        return Response({'detail': 'invalid_password'}, status=400)
    token = create_jwt({'uid': str(user.id), 'role': user.role})
    return Response({'token': token, 'user': UserPublicSerializer(user).data})

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects
    serializer_class = UserPublicSerializer
    permission_classes = [AllowAny]

    def get_serializer_class(self):
        if self.action == "create":
            return UserCreateSerializer
        return super().get_serializer_class()

    def get_queryset(self):
        # Recompute queryset on every request to avoid stale results
        return User.objects.order_by("-created_at")

@api_view(['GET'])
@permission_classes([AllowAny])
def me(request):
    u = getattr(request, 'user', None)
    if not u or getattr(u, 'is_anonymous', True):
        return Response({"detail": "anonymous"})
    return Response({"id": str(u.id), "email": u.email, "role": u.role})
