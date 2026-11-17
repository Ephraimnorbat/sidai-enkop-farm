from django.contrib.auth.models import User
from django.core.management.base import BaseCommand, CommandError

from permissions.models import UserProfile


class Command(BaseCommand):
    help = 'Restore Django admin and farm administrator access for a named account.'

    def add_arguments(self, parser):
        parser.add_argument('--username', required=True, help='Username of the account to promote.')

    def handle(self, *args, **options):
        username = options['username']
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist as exc:
            raise CommandError(f'No user exists with username "{username}".') from exc

        user.is_staff = True
        user.is_superuser = True
        user.save(update_fields=['is_staff', 'is_superuser'])

        profile, _ = UserProfile.objects.get_or_create(user=user)
        profile.role = 'admin'
        profile.is_active_employee = True
        profile.save()

        self.stdout.write(self.style.SUCCESS(
            f'Restored Django admin and farm administrator access for {username}.'
        ))
