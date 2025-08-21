from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework import status, viewsets
from .models import User
from rest_framework.permissions import AllowAny , IsAuthenticated
from .serializers import UserPublicSerializer, UserCreateSerializer, UserProfileSerializer
from django.http import HttpResponse
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

    @action(detail=True, methods=["post"], url_path="upload-cv")
    def upload_cv(self, request, pk=None):
        user = self.get_object()
        file_obj = request.FILES.get("cv_file")
        if not file_obj:
            return Response({"detail": "cv_file required"}, status=400)
        # PDF uniquement
        if not (file_obj.name.lower().endswith('.pdf') or file_obj.content_type == 'application/pdf'):
            return Response({"detail": "only_pdf_allowed"}, status=400)
        data = file_obj.read()
        user.cv_file.replace(data, filename=file_obj.name, content_type='application/pdf')
        user.save()
        return Response(UserProfileSerializer(user).data, status=200)

    @action(detail=True, methods=["get"], url_path="download-cv")
    def download_cv(self, request, pk=None):
        user = self.get_object()
        if not user.cv_file:
            return Response({"detail": "no_cv"}, status=404)
        # Retourner un lien GridFS-like n'est pas trivial via DRF; ici on renvoie un petit JSON
        return Response({"filename": getattr(user.cv_file, 'filename', 'cv.pdf')}, status=200)

    @action(detail=True, methods=["get"], url_path="cv")
    def get_cv_file(self, request, pk=None):
        user = self.get_object()
        if not user.cv_file:
            return Response({"detail": "no_cv"}, status=404)
        try:
            data = user.cv_file.read()
            filename = getattr(user.cv_file, 'filename', 'cv.pdf') or 'cv.pdf'
            resp = HttpResponse(data, content_type='application/pdf')
            resp['Content-Disposition'] = f'attachment; filename="{filename}"'
            return resp
        except Exception:
            return Response({"detail": "cv_read_error"}, status=500)

@api_view(['GET'])
@permission_classes([AllowAny])
def me(request):
    u = getattr(request, 'user', None)
    if not u or getattr(u, 'is_anonymous', True):
        return Response({"detail": "anonymous"})
    return Response({"id": str(u.id), "email": u.email, "role": u.role})
