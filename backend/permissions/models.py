from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    """Extended user profile with role information"""
    
    ROLE_CHOICES = [
        ('admin', 'Administrator'),
        ('manager', 'Manager'),
        ('staff', 'Staff'),
        ('worker', 'Worker'),
        ('farm_worker', 'Farm Worker'),
        ('farm_accountant', 'Farm Accountant'),
        ('guest', 'Guest User'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='guest')
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    employee_id = models.CharField(max_length=20, blank=True, null=True)
    hire_date = models.DateField(blank=True, null=True)
    is_active_employee = models.BooleanField(default=True)
    salary = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True, help_text="Monthly salary")
    weekly_tasks = models.TextField(blank=True, help_text="Comma-separated list of weekly tasks")
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.get_role_display()}"
    
    @property
    def full_name(self):
        return f"{self.user.first_name} {self.user.last_name}".strip()
    
    @property
    def is_admin(self):
        return self.role == 'admin'

    @property
    def is_manager(self):
        return self.role == 'manager'

    @property
    def is_staff(self):
        return self.role == 'staff'

    @property
    def is_worker(self):
        return self.role == 'worker'

    @property
    def is_farm_worker(self):
        return self.role == 'farm_worker'

    @property
    def is_farm_accountant(self):
        return self.role == 'farm_accountant'
    
    class Meta:
        verbose_name = 'User Profile'
        verbose_name_plural = 'User Profiles'
