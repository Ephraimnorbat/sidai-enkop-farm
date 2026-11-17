from rest_framework import serializers
from django.contrib.auth.models import User
from .models import FarmInventoryItem, StaffTask


class StaffTaskSerializer(serializers.ModelSerializer):
    staff_name = serializers.SerializerMethodField()
    staff_username = serializers.CharField(source='staff.username', read_only=True)

    class Meta:
        model = StaffTask
        fields = ['id', 'staff', 'staff_name', 'staff_username', 'title', 'description', 'task_date', 'status', 'completed_at', 'created_at']
        read_only_fields = ['id', 'completed_at', 'created_at']

    def get_staff_name(self, obj):
        return obj.staff.get_full_name() or obj.staff.username


class FarmInventoryItemSerializer(serializers.ModelSerializer):
    is_low_stock = serializers.ReadOnlyField()
    updated_by_name = serializers.CharField(source='updated_by.get_full_name', read_only=True)

    class Meta:
        model = FarmInventoryItem
        fields = ['id', 'name', 'category', 'quantity', 'unit', 'reorder_level', 'notes', 'is_low_stock', 'updated_by_name', 'updated_at']
        read_only_fields = ['id', 'is_low_stock', 'updated_by_name', 'updated_at']
