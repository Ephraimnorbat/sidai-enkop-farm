from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    # Your custom fields
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=30, blank=True)
    last_name = models.CharField(max_length=30, blank=True)

    # These fields are required to prevent clashes with the default auth.User model
    # Note that we are using different `related_name`s to solve the problem
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='accounts_user_set', # This related_name is unique
        blank=True,
        help_text=('The groups this user belongs to. A user will get all permissions '
                   'granted to each of their groups.'),
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='accounts_user_permissions', # This related_name is unique
        blank=True,
        help_text='Specific permissions for this user.',
    )

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']

    def __str__(self):
        return self.username