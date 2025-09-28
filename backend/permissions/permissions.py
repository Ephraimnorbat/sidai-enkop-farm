from rest_framework.permissions import BasePermission
from django.contrib.auth.models import Permission
from .models import UserProfile


class IsAdminUser(BasePermission):
    """Permission class for Farm Administrators"""
    
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and 
            hasattr(request.user, 'userprofile') and 
            request.user.userprofile.is_admin
        )


class IsFarmWorker(BasePermission):
    """Permission class for Farm Workers"""
    
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and 
            hasattr(request.user, 'userprofile') and 
            (request.user.userprofile.is_farm_worker or request.user.userprofile.is_admin)
        )


class IsFarmAccountant(BasePermission):
    """Permission class for Farm Accountants"""
    
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and 
            hasattr(request.user, 'userprofile') and 
            (request.user.userprofile.is_farm_accountant or request.user.userprofile.is_admin)
        )


class IsAdminOrReadOnlyFarmWorker(BasePermission):
    """
    Admin can do everything, Farm Workers can only read
    """
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
            
        if not hasattr(request.user, 'userprofile'):
            return False
            
        profile = request.user.userprofile
        
        # Admin has full access
        if profile.is_admin:
            return True
            
        # Farm workers can only read (GET, HEAD, OPTIONS)
        if profile.is_farm_worker:
            return request.method in ['GET', 'HEAD', 'OPTIONS']
            
        return False


class IsAdminOrFarmWorker(BasePermission):
    """
    Admin and Farm Workers can access, others cannot
    """
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
            
        if not hasattr(request.user, 'userprofile'):
            return False
            
        profile = request.user.userprofile
        return profile.is_admin or profile.is_farm_worker


class CanManageAnimals(BasePermission):
    """
    Custom permission for animal management
    - Admin: Full CRUD access
    - Farm Worker: Read and Update only (no create/delete)
    """
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
            
        if not hasattr(request.user, 'userprofile'):
            return False
            
        profile = request.user.userprofile
        
        # Admin has full access
        if profile.is_admin:
            return True
            
        # Farm workers have limited access
        if profile.is_farm_worker:
            # Allow read operations
            if request.method in ['GET', 'HEAD', 'OPTIONS']:
                return True
            # Allow updates but not create/delete
            if request.method in ['PUT', 'PATCH']:
                return True
            # Deny create and delete
            return False
            
        return False


class CanViewReports(BasePermission):
    """
    Permission to view reports and statistics
    """
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
            
        if not hasattr(request.user, 'userprofile'):
            return False
            
        profile = request.user.userprofile
        
        # Admin and Farm Workers can view reports
        return profile.is_admin or profile.is_farm_worker or profile.is_farm_accountant
