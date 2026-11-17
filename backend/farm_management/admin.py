from django.contrib import admin
from .models import FarmInventoryItem, StaffTask

admin.site.register(StaffTask)
admin.site.register(FarmInventoryItem)
