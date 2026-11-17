from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from . import views


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/', include('animals.urls')),
    path('api/gallery/', include('gallery.urls')),
    path('api/news/', include('news.urls')),
    path('api/staff/tasks/', views.tasks_view, name='staff-tasks'),
    path('api/staff/assignees/', views.task_assignees_view, name='staff-task-assignees'),
    path('api/staff/tasks/<int:task_id>/', views.task_detail_view, name='staff-task-detail'),
    path('api/staff/performance/', views.task_performance_view, name='staff-performance'),
    path('api/staff/tasks-export/', views.task_export_view, name='staff-tasks-export'),
    path('api/inventory/', views.inventory_view, name='inventory'),
    path('api/inventory/<int:item_id>/', views.inventory_detail_view, name='inventory-detail'),
]+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
