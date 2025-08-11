from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.http import HttpResponse, Http404
from django.db.models import Q

from .models import Animal
from .serializers import AnimalSerializer, AnimalCreateSerializer, AnimalListSerializer


class AnimalViewSet(viewsets.ModelViewSet):
    queryset = Animal.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['sex', 'breed', 'health_status', 'year_of_birth']
    search_fields = ['animal_id', 'name', 'notes']
    ordering_fields = ['created_at', 'animal_id', 'name', 'year_of_birth']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'create':
            return AnimalCreateSerializer
        elif self.action == 'list':
            return AnimalListSerializer
        return AnimalSerializer

    def get_queryset(self):
        queryset = Animal.objects.all()
        
        # Custom filtering
        sex = self.request.query_params.get('sex', None)
        breed = self.request.query_params.get('breed', None)
        min_age = self.request.query_params.get('min_age', None)
        max_age = self.request.query_params.get('max_age', None)
        health_status = self.request.query_params.get('health_status', None)
        
        if sex:
            queryset = queryset.filter(sex=sex)
        if breed:
            queryset = queryset.filter(breed=breed)
        if health_status:
            queryset = queryset.filter(health_status__icontains=health_status)
        
        # Age filtering (calculated field)
        if min_age or max_age:
            from datetime import datetime
            current_year = datetime.now().year
            
            if min_age:
                max_birth_year = current_year - int(min_age)
                queryset = queryset.filter(year_of_birth__lte=max_birth_year)
            
            if max_age:
                min_birth_year = current_year - int(max_age)
                queryset = queryset.filter(year_of_birth__gte=min_birth_year)
        
        return queryset

    @action(detail=True, methods=['get'])
    def qr_code(self, request, pk=None):
        """Download QR code image for an animal"""
        try:
            animal = self.get_object()
            if animal.qr_code:
                response = HttpResponse(animal.qr_code.read(), content_type='image/png')
                response['Content-Disposition'] = f'attachment; filename="qr_{animal.animal_id.replace("/", "_")}.png"'
                return response
            else:
                return Response({'error': 'QR code not available'}, status=status.HTTP_404_NOT_FOUND)
        except Animal.DoesNotExist:
            raise Http404

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get animal statistics"""
        total_animals = Animal.objects.count()
        
        stats = {
            'total_animals': total_animals,
            'by_sex': {
                'male': Animal.objects.filter(sex='Male').count(),
                'female': Animal.objects.filter(sex='Female').count(),
            },
            'by_breed': {},
            'by_health_status': {},
            'average_age': 0
        }
        
        # Breed statistics
        for choice in Animal.BREED_CHOICES:
            breed = choice[0]
            count = Animal.objects.filter(breed=breed).count()
            if count > 0:
                stats['by_breed'][breed] = count
        
        # Health status statistics
        health_statuses = Animal.objects.values_list('health_status', flat=True).distinct()
        for status_name in health_statuses:
            if status_name:
                stats['by_health_status'][status_name] = Animal.objects.filter(health_status=status_name).count()
        
        # Average age calculation
        if total_animals > 0:
            from datetime import datetime
            current_year = datetime.now().year
            animals = Animal.objects.all()
            total_age = sum(current_year - animal.year_of_birth for animal in animals)
            stats['average_age'] = round(total_age / total_animals, 1)
        
        return Response(stats)

    @action(detail=False, methods=['get'])
    def parents(self, request):
        """Get list of potential parents (for creating new animals)"""
        males = Animal.objects.filter(sex='Male').values('id', 'animal_id', 'name')
        females = Animal.objects.filter(sex='Female').values('id', 'animal_id', 'name')
        
        return Response({
            'fathers': list(males),
            'mothers': list(females)
        })

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        animal = serializer.save()
        
        # Return full animal data
        response_serializer = AnimalSerializer(animal, context={'request': request})
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
