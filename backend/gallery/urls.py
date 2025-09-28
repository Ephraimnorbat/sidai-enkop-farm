from rest_framework.routers import DefaultRouter
from .views import GalleryImageViewSet
from django.urls import path, include

router = DefaultRouter()
router.register(r'gallery', GalleryImageViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
