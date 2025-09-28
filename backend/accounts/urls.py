from django.urls import path
from . import views

app_name = 'accounts'

urlpatterns = [
    path('register/', views.register_view, name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('profile/', views.user_profile_view, name='profile'),
    path('csrf-token/', views.csrf_token_view, name='csrf_token'),
    path('users/', views.list_users_view, name='list_users'),
    path('users/<int:user_id>/role/', views.update_user_role_view, name='update_user_role'),
]
