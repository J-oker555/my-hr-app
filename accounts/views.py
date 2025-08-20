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
    ser = UserCreateSerializer(data=request.data); ser.is_valid(raise_exception=True)
    user = ser.save(); token = create_jwt({'uid': str(user.id), 'role': user.role})
    return Response({'token': token, 'user': UserPublicSerializer(user).data}, status=201)

@api_view(['POST'])
@permission_classes([AllowAny]) 
def login(request):
    email = request.data.get('email'); password = request.data.get('password')
    user = User.objects(email=email, is_active=True).first()
    if not user or not user.check_password(password): return Response({'detail':'Invalid credentials'}, status=400)
    token = create_jwt({'uid': str(user.id), 'role': user.role})
    return Response({'token': token, 'user': UserPublicSerializer(user).data})

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects
    serializer_class = UserPublicSerializer
    permission_classes = [IsAdmin]

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    u = request.user
    return Response({"id": str(u.id), "email": u.email, "role": u.role})
