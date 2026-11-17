from permissions.serializers import UserProfileSerializer
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import login, logout
from django.middleware.csrf import get_token
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.contrib.auth.models import User
from .serializers import UserRegistrationSerializer, UserLoginSerializer, UserSerializer
from permissions.permissions import IsAdminUser
from permissions.models import UserProfile


def user_payload(user):
    """Return user data with farm roles and permissions, including Django superusers."""
    profile = getattr(user, 'userprofile', None)
    if user.is_superuser:
        profile, _ = UserProfile.objects.get_or_create(user=user)
        if profile.role != 'admin':
            profile.role = 'admin'
            profile.save()
    elif profile and profile.role == 'admin':
        # Repair older farm-admin accounts whose Django flags were cleared by the old signal.
        user.is_staff = True
        user.is_superuser = True
        user.save(update_fields=['is_staff', 'is_superuser'])

    is_admin = user.is_superuser or bool(profile and profile.role == 'admin')
    is_manager = bool(profile and profile.role == 'manager')
    role = 'admin' if is_admin else (profile.role if profile else 'guest')
    user_data = UserSerializer(user).data
    user_data.update({
        'role': role,
        'role_display': 'Administrator' if is_admin else (profile.get_role_display() if profile else 'Guest User'),
        'permissions': {
            'can_create_animals': is_admin or is_manager,
            'can_edit_animals': is_admin or is_manager or bool(profile and profile.is_farm_worker),
            'can_delete_animals': is_admin or is_manager,
            'can_view_reports': is_admin or is_manager or bool(profile and (profile.is_farm_worker or profile.is_farm_accountant)),
            'can_manage_users': is_admin or is_manager,
        },
    })
    return user_data

@api_view(['POST'])
@permission_classes([IsAdminUser])
def create_user_view(request):
    """Create a new user with role, salary, and weekly tasks (Admin only)"""
    user_data = request.data.get('user', {})
    profile_data = request.data.get('profile', {})
    if profile_data.get('role') == 'admin' and not request.user.is_superuser:
        return Response({'detail': 'Only a superuser can create an administrator account.'}, status=status.HTTP_403_FORBIDDEN)

    # Create user
    serializer = UserRegistrationSerializer(data=user_data)
    if serializer.is_valid():
        user = serializer.save()
        # Create or update profile
        profile, created = UserProfile.objects.get_or_create(user=user)
        profile.role = profile_data.get('role', 'guest')
        profile.salary = profile_data.get('salary') or None
        profile.weekly_tasks = profile_data.get('weekly_tasks', '')
        profile.phone_number = profile_data.get('phone_number')
        profile.employee_id = profile_data.get('employee_id')
        profile.hire_date = profile_data.get('hire_date') or None
        profile.is_active_employee = profile_data.get('is_active_employee', True)
        profile.notes = profile_data.get('notes', '')
        profile.save()
        return Response({
            'message': 'User created successfully',
            'user': user_payload(user),
            'profile': UserProfileSerializer(profile).data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)





@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        token, created = Token.objects.get_or_create(user=user)
        
        return Response({
            'message': 'Registration successful',
            'user': UserSerializer(user).data,
            'token': token.key,
            'csrf_token': get_token(request)
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    serializer = UserLoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        
        # Create session
        login(request, user)
        
        return Response({
            'message': 'Login successful',
            'user': user_payload(user),
            'token': token.key,
            'csrf_token': get_token(request)
        }, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    try:
        # Delete token
        Token.objects.filter(user=request.user).delete()
        
        # Clear session
        logout(request)
        
        return Response({
            'message': 'Logout successful'
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'error': 'Something went wrong'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile_view(request):
    return Response(user_payload(request.user))


@api_view(['GET'])
@permission_classes([AllowAny])
def csrf_token_view(request):
    return Response({'csrf_token': get_token(request)})


@api_view(['GET'])
@permission_classes([IsAdminUser])
def list_users_view(request):
    """List all farm accounts for administrators and managers."""
    users = User.objects.all().select_related('userprofile')
    users_data = []
    
    for user in users:
        user_data = UserSerializer(user).data
        if hasattr(user, 'userprofile'):
            user_data['role'] = user.userprofile.role
            user_data['role_display'] = user.userprofile.get_role_display()
            user_data['phone_number'] = user.userprofile.phone_number
            user_data['employee_id'] = user.userprofile.employee_id
            user_data['is_active_employee'] = user.userprofile.is_active_employee
            user_data['salary'] = user.userprofile.salary
            user_data['weekly_tasks'] = user.userprofile.weekly_tasks
        else:
            user_data['role'] = 'guest'
            user_data['role_display'] = 'Guest User'
            user_data['salary'] = None
            user_data['weekly_tasks'] = ''
        users_data.append(user_data)
    return Response({'users': users_data})


@api_view(['PATCH', 'DELETE'])
@permission_classes([IsAdminUser])
def manage_user_view(request, user_id):
    try:
        user = User.objects.select_related('userprofile').get(pk=user_id)
    except User.DoesNotExist:
        return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'DELETE':
        if request.user.pk == user.pk:
            return Response({'detail': 'You cannot delete your own account.'}, status=status.HTTP_400_BAD_REQUEST)
        if (user.is_superuser or getattr(getattr(user, 'userprofile', None), 'role', None) == 'admin') and not request.user.is_superuser:
            return Response({'detail': 'Only a superuser can remove an administrator account.'}, status=status.HTTP_403_FORBIDDEN)
        Token.objects.filter(user=user).delete()
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    profile, _ = UserProfile.objects.get_or_create(user=user)
    if (user.is_superuser or profile.role == 'admin') and not request.user.is_superuser:
        return Response({'detail': 'Only a superuser can change an administrator account.'}, status=status.HTTP_403_FORBIDDEN)
    for field in ('username', 'email', 'first_name', 'last_name', 'is_active'):
        if field in request.data:
            setattr(user, field, request.data[field])
    if 'role' in request.data:
        new_role = request.data['role']
        valid_roles = ['admin', 'manager', 'staff', 'worker', 'farm_worker', 'farm_accountant', 'guest']
        if new_role not in valid_roles:
            return Response({'role': ['Invalid role.']}, status=status.HTTP_400_BAD_REQUEST)
        if new_role == 'admin' and not request.user.is_superuser:
            return Response({'detail': 'Only a superuser can assign the administrator role.'}, status=status.HTTP_403_FORBIDDEN)
        profile.role = new_role
    for field in ('salary', 'weekly_tasks', 'phone_number', 'employee_id', 'hire_date', 'is_active_employee', 'notes'):
        if field in request.data:
            setattr(profile, field, request.data[field])
    user.save()
    profile.save()
    return Response({'user': user_payload(user)})


@api_view(['PUT'])
@permission_classes([IsAdminUser])
def update_user_role_view(request, user_id):
    """Update user role - Admin only"""
    try:
        user = User.objects.get(id=user_id)
        profile, created = UserProfile.objects.get_or_create(user=user)
        
        new_role = request.data.get('role')
        valid_roles = ['admin', 'manager', 'staff', 'worker', 'farm_worker', 'farm_accountant', 'guest']
        if new_role not in valid_roles:
            return Response({'error': 'Invalid role'}, status=status.HTTP_400_BAD_REQUEST)
        if new_role == 'admin' and not request.user.is_superuser:
            return Response({'detail': 'Only a superuser can assign the administrator role.'}, status=status.HTTP_403_FORBIDDEN)
        if (user.is_superuser or profile.role == 'admin') and not request.user.is_superuser:
            return Response({'detail': 'Only a superuser can change an administrator account.'}, status=status.HTTP_403_FORBIDDEN)

        profile.role = new_role
        # Update salary and weekly_tasks if provided
        if 'salary' in request.data:
            profile.salary = request.data['salary']
        if 'weekly_tasks' in request.data:
            profile.weekly_tasks = request.data['weekly_tasks']
        profile.save()  # This will trigger the signal to update groups

        return Response({
            'message': f'User {user.username} role updated to {profile.get_role_display()}',
            'user': {
                'id': user.id,
                'username': user.username,
                'role': profile.role,
                'role_display': profile.get_role_display(),
                'salary': profile.salary,
                'weekly_tasks': profile.weekly_tasks
            }
        })
        
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
