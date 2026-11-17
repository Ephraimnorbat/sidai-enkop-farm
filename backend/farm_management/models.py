from django.contrib.auth.models import User
from django.db import models
from django.core.validators import MinValueValidator


class StaffTask(models.Model):
    STATUS_CHOICES = [('pending', 'Pending'), ('completed', 'Completed')]

    staff = models.ForeignKey(User, on_delete=models.CASCADE, related_name='farm_tasks')
    title = models.CharField(max_length=160)
    description = models.TextField(blank=True)
    task_date = models.DateField(db_index=True)
    status = models.CharField(max_length=12, choices=STATUS_CHOICES, default='pending')
    completed_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-task_date', 'staff__first_name', 'title']

    def __str__(self):
        return f'{self.title} — {self.staff.username} ({self.task_date})'


class FarmInventoryItem(models.Model):
    name = models.CharField(max_length=160, unique=True)
    category = models.CharField(max_length=80, blank=True)
    quantity = models.DecimalField(max_digits=12, decimal_places=2, default=0, validators=[MinValueValidator(0)])
    unit = models.CharField(max_length=32, default='units')
    reorder_level = models.DecimalField(max_digits=12, decimal_places=2, default=0, validators=[MinValueValidator(0)])
    notes = models.TextField(blank=True)
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['category', 'name']
        verbose_name_plural = 'farm inventory items'

    @property
    def is_low_stock(self):
        return self.quantity <= self.reorder_level

    def __str__(self):
        return f'{self.name} ({self.quantity} {self.unit})'
