from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'animals', views.AnimalViewSet)

app_name = 'animals'

urlpatterns = [
    path('api/', include(router.urls)),
]
