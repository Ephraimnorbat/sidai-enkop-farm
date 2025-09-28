from rest_framework.routers import DefaultRouter
from .views import NewsViewSet
from django.urls import path, include

router = DefaultRouter()
router.register(r'news', NewsViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
