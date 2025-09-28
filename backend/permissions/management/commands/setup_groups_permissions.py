from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group, Permission, User
from django.contrib.contenttypes.models import ContentType
from animals.models import Animal
from permissions.models import UserProfile


class Command(BaseCommand):
    help = 'Set up user groups and permissions for Sidai Enkop Farm'

    def handle(self, *args, **options):
        self.stdout.write('Setting up groups and permissions...')
        
        # Create Groups
        admin_group, created = Group.objects.get_or_create(name='Farm Administrators')
        if created:
            self.stdout.write(self.style.SUCCESS(f'Created group: {admin_group.name}'))
        
        worker_group, created = Group.objects.get_or_create(name='Farm Workers')
        if created:
            self.stdout.write(self.style.SUCCESS(f'Created group: {worker_group.name}'))
        
        accountant_group, created = Group.objects.get_or_create(name='Farm Accountants')
        if created:
            self.stdout.write(self.style.SUCCESS(f'Created group: {accountant_group.name}'))
        
        guest_group, created = Group.objects.get_or_create(name='Guest Users')
        if created:
            self.stdout.write(self.style.SUCCESS(f'Created group: {guest_group.name}'))
        
        # Get content types
        animal_ct = ContentType.objects.get_for_model(Animal)
        profile_ct = ContentType.objects.get_for_model(UserProfile)
        
        # Create custom permissions
        custom_permissions = [
            ('can_view_reports', 'Can view farm reports'),
            ('can_export_data', 'Can export farm data'),
            ('can_manage_users', 'Can manage user accounts'),
            ('can_manage_finances', 'Can manage farm finances'),
        ]
        
        for codename, name in custom_permissions:
            permission, created = Permission.objects.get_or_create(
                codename=codename,
                content_type=animal_ct,
                defaults={'name': name}
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created permission: {name}'))
        
        # Assign permissions to groups
        
        # Farm Administrators - Full access to everything
        admin_permissions = Permission.objects.filter(
            content_type__in=[animal_ct, profile_ct]
        )
        admin_group.permissions.set(admin_permissions)
        self.stdout.write(f'Assigned {admin_permissions.count()} permissions to Farm Administrators')
        
        # Farm Workers - Read animals, limited updates
        worker_permissions = Permission.objects.filter(
            codename__in=[
                'view_animal',
                'change_animal',  # Can update but not create/delete
                'can_view_reports',
            ],
            content_type=animal_ct
        )
        worker_group.permissions.set(worker_permissions)
        self.stdout.write(f'Assigned {worker_permissions.count()} permissions to Farm Workers')
        
        # Farm Accountants - View reports, manage finances (when implemented)
        accountant_permissions = Permission.objects.filter(
            codename__in=[
                'view_animal',
                'can_view_reports',
                'can_export_data',
                'can_manage_finances',
            ],
            content_type=animal_ct
        )
        accountant_group.permissions.set(accountant_permissions)
        self.stdout.write(f'Assigned {accountant_permissions.count()} permissions to Farm Accountants')
        
        # Guest Users - No permissions (view-only through API restrictions)
        guest_group.permissions.clear()
        self.stdout.write('Guest Users have no special permissions')
        
        # Update existing users' profiles and groups
        self.stdout.write('\nUpdating existing users...')
        for user in User.objects.all():
            profile, created = UserProfile.objects.get_or_create(user=user)
            if created:
                # First user becomes admin
                if User.objects.count() == 1:
                    profile.role = 'admin'
                    user.groups.add(admin_group)
                    user.is_staff = True
                    user.is_superuser = True
                    user.save()
                else:
                    profile.role = 'guest'
                    user.groups.add(guest_group)
                profile.save()
                self.stdout.write(f'Created profile for {user.username} as {profile.get_role_display()}')
        
        self.stdout.write(
            self.style.SUCCESS('\nSuccessfully set up groups and permissions!')
        )
        
        # Display summary
        self.stdout.write('\n=== ROLE SUMMARY ===')
        self.stdout.write('Farm Administrators:')
        self.stdout.write('  ✅ Full access to all animals (CRUD)')
        self.stdout.write('  ✅ User management')
        self.stdout.write('  ✅ All reports and exports')
        self.stdout.write('  ✅ Django admin access')
        
        self.stdout.write('\nFarm Workers:')
        self.stdout.write('  ✅ View all animals')
        self.stdout.write('  ✅ Update animal records (no create/delete)')
        self.stdout.write('  ✅ View reports')
        self.stdout.write('  ❌ No user management')
        
        self.stdout.write('\nFarm Accountants:')
        self.stdout.write('  ✅ View animals')
        self.stdout.write('  ✅ View reports and export data')
        self.stdout.write('  ✅ Manage finances (when implemented)')
        self.stdout.write('  ❌ No animal modifications')
        
        self.stdout.write('\nGuest Users:')
        self.stdout.write('  ❌ No access to animal records')
        self.stdout.write('  ❌ No reports access')
        self.stdout.write('  ❌ Must be promoted by admin')
