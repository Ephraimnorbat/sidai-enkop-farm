from datetime import date, timedelta
from io import BytesIO

from django.contrib.auth.models import User
from django.db.models import F, Q
from django.http import HttpResponse
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import FarmInventoryItem, StaffTask
from .serializers import FarmInventoryItemSerializer, StaffTaskSerializer


def role(user):
    return getattr(getattr(user, 'userprofile', None), 'role', 'guest')


def can_manage(user):
    return role(user) in {'admin', 'manager'} or user.is_superuser


def can_log_tasks(user):
    profile = getattr(user, 'userprofile', None)
    return can_manage(user) or bool(profile and profile.is_active_employee and profile.role in {'staff', 'worker', 'farm_worker'})


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def tasks_view(request):
    if request.method == 'GET':
        qs = StaffTask.objects.select_related('staff').all()
        if not can_manage(request.user):
            qs = qs.filter(staff=request.user)
        if request.query_params.get('start'):
            qs = qs.filter(task_date__gte=request.query_params['start'])
        if request.query_params.get('end'):
            qs = qs.filter(task_date__lte=request.query_params['end'])
        return Response(StaffTaskSerializer(qs, many=True).data)

    if not can_log_tasks(request.user):
        return Response({'detail': 'An active farm staff account is required to log tasks.'}, status=403)
    data = request.data.copy()
    if not can_manage(request.user):
        data['staff'] = request.user.pk
    serializer = StaffTaskSerializer(data=data)
    serializer.is_valid(raise_exception=True)
    task = serializer.save()
    if task.status == 'completed':
        task.completed_at = timezone.now()
        task.save(update_fields=['completed_at'])
    return Response(StaffTaskSerializer(task).data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def task_assignees_view(request):
    if not can_manage(request.user):
        return Response({'detail': 'Manager access required.'}, status=403)
    users = User.objects.filter(
        is_active=True,
        userprofile__is_active_employee=True,
        userprofile__role__in=['staff', 'worker', 'farm_worker'],
    ).select_related('userprofile').order_by('first_name', 'last_name', 'username')
    return Response([
        {
            'id': user.id,
            'name': user.get_full_name() or user.username,
            'username': user.username,
            'role': user.userprofile.get_role_display(),
        }
        for user in users
    ])


@api_view(['PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def task_detail_view(request, task_id):
    try:
        task = StaffTask.objects.select_related('staff').get(pk=task_id)
    except StaffTask.DoesNotExist:
        return Response({'detail': 'Task not found.'}, status=404)
    if task.staff_id != request.user.id and not can_manage(request.user):
        return Response({'detail': 'You can only update your own tasks.'}, status=403)
    if request.method == 'DELETE':
        if not can_manage(request.user):
            return Response({'detail': 'Only a manager can delete tasks.'}, status=403)
        task.delete()
        return Response(status=204)
    data = request.data.copy()
    if not can_manage(request.user):
        data.pop('staff', None)
    serializer = StaffTaskSerializer(task, data=data, partial=True)
    serializer.is_valid(raise_exception=True)
    task = serializer.save()
    task.completed_at = timezone.now() if task.status == 'completed' else None
    task.save(update_fields=['completed_at', 'updated_at'])
    return Response(StaffTaskSerializer(task).data)


def report_range(request):
    today = timezone.localdate()
    period = request.query_params.get('period', 'week')
    if period == 'month':
        start = today.replace(day=1)
        end = (start.replace(day=28) + timedelta(days=4)).replace(day=1) - timedelta(days=1)
    else:
        start = today - timedelta(days=today.weekday())
        end = start + timedelta(days=6)
    start = date.fromisoformat(request.query_params.get('start', str(start)))
    end = date.fromisoformat(request.query_params.get('end', str(end)))
    return start, end


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def task_performance_view(request):
    if not can_manage(request.user):
        return Response({'detail': 'Manager access required.'}, status=403)
    try:
        start, end = report_range(request)
    except ValueError:
        return Response({'detail': 'Use YYYY-MM-DD for start and end dates.'}, status=400)
    if end < start:
        return Response({'detail': 'The end date must be on or after the start date.'}, status=400)
    staff = User.objects.filter(userprofile__is_active_employee=True, userprofile__role__in=['staff', 'worker', 'farm_worker', 'manager']).distinct()
    tasks = StaffTask.objects.filter(task_date__range=(start, end))
    result = []
    for user in staff:
        qs = tasks.filter(staff=user)
        total = qs.count()
        completed = qs.filter(status='completed').count()
        result.append({'staff_id': user.id, 'staff_name': user.get_full_name() or user.username, 'total_tasks': total, 'completed_tasks': completed, 'completion_rate': round(completed * 100 / total) if total else 0})
    return Response({'start': start, 'end': end, 'staff': result})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def task_export_view(request):
    if not can_manage(request.user):
        return Response({'detail': 'Manager access required.'}, status=403)
    try:
        start, end = report_range(request)
    except ValueError:
        return Response({'detail': 'Use YYYY-MM-DD for start and end dates.'}, status=400)
    if end < start:
        return Response({'detail': 'The end date must be on or after the start date.'}, status=400)
    try:
        from openpyxl import Workbook
        from openpyxl.styles import Font, PatternFill
    except ImportError:
        return Response({'detail': 'Excel export is not configured on this server.'}, status=503)
    wb = Workbook()
    ws = wb.active
    ws.title = 'Staff tasks'
    ws.append(['Staff member', 'Username', 'Date', 'Task', 'Description', 'Status', 'Completed at'])
    for task in StaffTask.objects.filter(task_date__range=(start, end)).select_related('staff'):
        ws.append([task.staff.get_full_name() or task.staff.username, task.staff.username, task.task_date.isoformat(), task.title, task.description, task.get_status_display(), timezone.localtime(task.completed_at).strftime('%Y-%m-%d %H:%M') if task.completed_at else ''])
    for column in ws.columns:
        ws.column_dimensions[column[0].column_letter].width = min(max(max(len(str(cell.value or '')) for cell in column) + 2, 14), 48)
    ws.freeze_panes = 'A2'
    ws.auto_filter.ref = ws.dimensions
    for cell in ws[1]:
        cell.font = Font(bold=True, color='FFFFFF')
        cell.fill = PatternFill('solid', fgColor='2E7D50')
    response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    response['Content-Disposition'] = f'attachment; filename="staff-tasks-{start}-to-{end}.xlsx"'
    output = BytesIO()
    wb.save(output)
    response.content = output.getvalue()
    return response


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def inventory_view(request):
    if request.method == 'GET':
        qs = FarmInventoryItem.objects.all()
        search = request.query_params.get('search')
        if search:
            qs = qs.filter(Q(name__icontains=search) | Q(category__icontains=search))
        if request.query_params.get('low_stock') == 'true':
            qs = qs.filter(quantity__lte=F('reorder_level'))
        return Response(FarmInventoryItemSerializer(qs, many=True).data)
    if not can_manage(request.user):
        return Response({'detail': 'Manager access required to change inventory.'}, status=403)
    serializer = FarmInventoryItemSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    item = serializer.save(updated_by=request.user)
    return Response(FarmInventoryItemSerializer(item).data, status=201)


@api_view(['PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def inventory_detail_view(request, item_id):
    if not can_manage(request.user):
        return Response({'detail': 'Manager access required to change inventory.'}, status=403)
    try:
        item = FarmInventoryItem.objects.get(pk=item_id)
    except FarmInventoryItem.DoesNotExist:
        return Response({'detail': 'Inventory item not found.'}, status=404)
    if request.method == 'DELETE':
        item.delete()
        return Response(status=204)
    serializer = FarmInventoryItemSerializer(item, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    item = serializer.save(updated_by=request.user)
    return Response(FarmInventoryItemSerializer(item).data)
