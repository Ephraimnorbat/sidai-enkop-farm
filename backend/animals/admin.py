from django.contrib import admin
from .models import Animal


@admin.register(Animal)
class AnimalAdmin(admin.ModelAdmin):
    list_display = ['animal_id', 'name', 'sex', 'breed', 'year_of_birth', 'health_status', 'created_at']
    list_filter = ['sex', 'breed', 'health_status', 'year_of_birth']
    search_fields = ['animal_id', 'name', 'notes']
    readonly_fields = ['animal_id', 'qr_code', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('animal_id', 'name', 'sex', 'breed', 'year_of_birth')
        }),
        ('Parentage', {
            'fields': ('father', 'mother'),
            'classes': ('collapse',)
        }),
        ('Physical & Health', {
            'fields': ('weight', 'health_status', 'notes')
        }),
        ('System', {
            'fields': ('qr_code', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
