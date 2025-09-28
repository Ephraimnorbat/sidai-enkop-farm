from django.contrib import admin
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import UserProfile


class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'Profile'
    fields = ('role', 'phone_number', 'employee_id', 'hire_date', 'is_active_employee', 'notes')


class UserAdmin(BaseUserAdmin):
    inlines = (UserProfileInline,)
    list_display = ('username', 'email', 'first_name', 'last_name', 'get_role', 'is_staff', 'is_active')
    list_filter = ('userprofile__role', 'is_staff', 'is_superuser', 'is_active', 'groups')
    
    def get_role(self, obj):
        if hasattr(obj, 'userprofile'):
            return obj.userprofile.get_role_display()
        return 'No Profile'
    get_role.short_description = 'Role'


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'role', 'employee_id', 'phone_number', 'is_active_employee', 'created_at']
    list_filter = ['role', 'is_active_employee', 'created_at']
    search_fields = ['user__username', 'user__email', 'employee_id', 'phone_number']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('User Information', {
            'fields': ('user',)
        }),
        ('Role & Employment', {
            'fields': ('role', 'employee_id', 'hire_date', 'is_active_employee')
        }),
        ('Contact Information', {
            'fields': ('phone_number',)
        }),
        ('Additional Information', {
            'fields': ('notes',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


# Re-register UserAdmin
admin.site.unregister(User)
admin.site.register(User, UserAdmin)
