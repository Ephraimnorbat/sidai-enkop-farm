from rest_framework import serializers
from .models import Animal


class AnimalSerializer(serializers.ModelSerializer):
    age = serializers.ReadOnlyField()
    offspring_count = serializers.ReadOnlyField()
    father_name = serializers.CharField(source='father.name', read_only=True)
    mother_name = serializers.CharField(source='mother.name', read_only=True)
    qr_code_url = serializers.SerializerMethodField()

    class Meta:
        model = Animal
        fields = [
            'id', 'animal_id', 'type', 'name', 'sex', 'breed', 'year_of_birth',
            'father', 'mother', 'father_name', 'mother_name', 'weight',
            'health_status', 'notes', 'qr_code', 'qr_code_url', 'age',
            'offspring_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'animal_id', 'qr_code', 'created_at', 'updated_at']

    def get_qr_code_url(self, obj):
        if obj.qr_code:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.qr_code.url)
        return None

    def validate_father(self, value):
        if value and value.sex != 'Male':
            raise serializers.ValidationError("Father must be a male animal.")
        return value

    def validate_mother(self, value):
        if value and value.sex != 'Female':
            raise serializers.ValidationError("Mother must be a female animal.")
        return value

    def validate_year_of_birth(self, value):
        from datetime import datetime
        current_year = datetime.now().year
        if value > current_year:
            raise serializers.ValidationError("Year of birth cannot be in the future.")
        if value < 1900:
            raise serializers.ValidationError("Year of birth seems too old.")
        return value


class AnimalCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Animal
        fields = [
            'type', 'name', 'sex', 'breed', 'year_of_birth', 'father', 'mother',
            'weight', 'health_status', 'notes'
        ]

    def validate_father(self, value):
        if value and value.sex != 'Male':
            raise serializers.ValidationError("Father must be a male animal.")
        return value

    def validate_mother(self, value):
        if value and value.sex != 'Female':
            raise serializers.ValidationError("Mother must be a female animal.")
        return value

    def validate_year_of_birth(self, value):
        from datetime import datetime
        current_year = datetime.now().year
        if value > current_year:
            raise serializers.ValidationError("Year of birth cannot be in the future.")
        if value < 1900:
            raise serializers.ValidationError("Year of birth seems too old.")
        return value


class AnimalListSerializer(serializers.ModelSerializer):
    age = serializers.ReadOnlyField()
    father_name = serializers.CharField(source='father.name', read_only=True)
    mother_name = serializers.CharField(source='mother.name', read_only=True)

    class Meta:
        model = Animal
        fields = [
            'id', 'animal_id', 'type', 'name', 'sex', 'breed', 'year_of_birth',
            'father_name', 'mother_name', 'weight', 'health_status',
            'age', 'created_at'
        ]
