import os
import qrcode
import json
from io import BytesIO
from django.db import models
from django.core.files import File
from django.core.files.uploadedfile import InMemoryUploadedFile


class Animal(models.Model):
    SEX_CHOICES = [
        ('Male', 'Male'),
        ('Female', 'Female'),
    ]
    
    BREED_CHOICES = [
        ('Jersey', 'Jersey'),
        ('Holstein', 'Holstein'),
        ('Guernsey', 'Guernsey'),
        ('Ayrshire', 'Ayrshire'),
        ('Brown_Swiss', 'Brown Swiss'),
        ('Zebu', 'Zebu'),
        ('Crossbreed', 'Crossbreed'),
    ]

    animal_id = models.CharField(max_length=20, unique=True, blank=True)
    name = models.CharField(max_length=100)
    sex = models.CharField(max_length=6, choices=SEX_CHOICES)
    breed = models.CharField(max_length=20, choices=BREED_CHOICES)
    year_of_birth = models.IntegerField()
    father = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='offspring_as_father')
    mother = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='offspring_as_mother')
    weight = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True, help_text="Weight in kg")
    health_status = models.CharField(max_length=50, blank=True, default="Healthy")
    notes = models.TextField(blank=True)
    qr_code = models.ImageField(upload_to='qr_codes/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.animal_id} - {self.name}"

    def save(self, *args, **kwargs):
        if not self.animal_id:
            self.animal_id = self.generate_animal_id()
        
        super().save(*args, **kwargs)
        
        if not self.qr_code:
            self.generate_qr_code()
            super().save(update_fields=['qr_code'])

    def generate_animal_id(self):
        # Format: [Species][Sex][Breed]/[Number]
        # C = Cow, M/F = Male/Female, J = Jersey (first letter of breed), 001 = sequence
        species = 'C'  # Cow
        sex_code = self.sex[0]  # M or F
        breed_code = self.breed[0]  # First letter of breed
        
        # Get the next sequence number for this combination
        prefix = f"{species}{sex_code}{breed_code}"
        last_animal = Animal.objects.filter(
            animal_id__startswith=prefix
        ).order_by('-animal_id').first()
        
        if last_animal and last_animal.animal_id:
            try:
                last_number = int(last_animal.animal_id.split('/')[1])
                next_number = last_number + 1
            except (IndexError, ValueError):
                next_number = 1
        else:
            next_number = 1
        
        return f"{prefix}/{next_number:03d}"

    def generate_qr_code(self):
        if self.animal_id:
            # Data to encode in QR code
            qr_data = {
                'animal_id': self.animal_id,
                'name': self.name,
                'sex': self.sex,
                'breed': self.breed,
                'year_of_birth': self.year_of_birth,
                'father_id': self.father.animal_id if self.father else None,
                'mother_id': self.mother.animal_id if self.mother else None,
                'weight': str(self.weight) if self.weight else None,
                'health_status': self.health_status,
                'notes': self.notes,
                'farm': 'Sidai Enkop Ranch - Isinya, Kitengela'
            }
            
            # Create QR code
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_L,
                box_size=10,
                border=4,
            )
            qr.add_data(json.dumps(qr_data))
            qr.make(fit=True)

            # Create QR code image
            qr_img = qr.make_image(fill_color="black", back_color="white")
            
            # Save to BytesIO
            buffer = BytesIO()
            qr_img.save(buffer, format='PNG')
            buffer.seek(0)
            
            # Create Django file
            filename = f'qr_{self.animal_id.replace("/", "_")}.png'
            qr_file = InMemoryUploadedFile(
                buffer, None, filename, 'image/png',
                buffer.getvalue().__len__(), None
            )
            
            self.qr_code.save(filename, qr_file, save=False)

    @property
    def age(self):
        from datetime import datetime
        current_year = datetime.now().year
        return current_year - self.year_of_birth

    @property
    def offspring_count(self):
        if self.sex == 'Female':
            return self.offspring_as_mother.count()
        else:
            return self.offspring_as_father.count()
