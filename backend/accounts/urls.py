from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import register, login, UserViewSet, me
router = DefaultRouter()
router.register('users', UserViewSet, basename='users')
urlpatterns = [
    path('auth/register/', register),
    path('auth/login/', login),
    path('', include(router.urls)),
    path('auth/me/', me),
]
