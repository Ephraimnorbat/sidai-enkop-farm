from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User, Group
from .models import UserProfile


@receiver(post_save, sender=User)
def create_or_update_user_profile(sender, instance, created, **kwargs):
    """Automatically create UserProfile when User is created"""
    if created:
        profile = UserProfile.objects.create(user=instance)
        # Assign default role based on whether this is the first user (admin) or not
        if User.objects.count() == 1:
            profile.role = 'admin'
        else:
            profile.role = 'guest'
        
        profile.save()


@receiver(post_save, sender=UserProfile)
def update_user_groups(sender, instance, created, **kwargs):
    """Update user groups when role changes"""
    user = instance.user
    
    # Remove from all farm-related groups
    farm_groups = Group.objects.filter(name__in=[
        'Farm Administrators',
        'Farm Workers', 
        'Farm Accountants',
        'Guest Users'
    ])
    user.groups.remove(*farm_groups)
    
    # Add to appropriate group based on role
    group_mapping = {
        'admin': 'Farm Administrators',
        'farm_worker': 'Farm Workers',
        'farm_accountant': 'Farm Accountants',
        'guest': 'Guest Users',
    }
    
    if instance.role in group_mapping:
        group, _ = Group.objects.get_or_create(name=group_mapping[instance.role])
        user.groups.add(group)
        
        # Set staff and superuser status for admins
        needs_update = False
        if instance.role == 'admin':
            if not user.is_staff or not user.is_superuser:
                user.is_staff = True
                user.is_superuser = True
                needs_update = True
        else:
            if user.is_staff or user.is_superuser:
                user.is_staff = False
                user.is_superuser = False
                needs_update = True
        
        if needs_update:
            # Use update to avoid triggering signals
            User.objects.filter(pk=user.pk).update(
                is_staff=user.is_staff,
                is_superuser=user.is_superuser
            )
