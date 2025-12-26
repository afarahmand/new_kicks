from datetime import timedelta
from django.core.exceptions import ValidationError
from django.core.validators import MaxLengthValidator, MinLengthValidator, MinValueValidator
from django.db import models
from django.utils import timezone

from .user import User
from ..mixins.timestamps import TimestampMixin
from ..mixins.validate_on_save import ValidateOnSaveMixin

def validate_max_date(value):
    max_date = timezone.now() + timedelta(years=1)

    if value > max_date:
        raise ValidationError(f"The funding end date must be less than one year away")

def validate_min_date(value):
    if value < timezone.now():
        raise ValidationError(f"The funding end date must be in the future")

class Project(TimestampMixin, ValidateOnSaveMixin, models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    category = models.CharField(
        choices=[
            ('Art', 'Art'),
            ('Fashion', 'Fashion'),
            ('Film', 'Film'),
            ('Food', 'Food'),
            ('Games', 'Games'),
            ('Technology', 'Technology')
        ],
    )

    description = models.TextField(
        validators=[MinLengthValidator(200)]
    )

    funding_amount = models.IntegerField(
        validators=[MinValueValidator(1)]
    )

    funding_end_date = models.DateTimeField(
        validators=[validate_min_date, validate_max_date],
        help_text="Funding end date must be sometime within the next year"
    )

    image_url = models.URLField()

    short_blurb = models.TextField(
        validators=[MinLengthValidator(20), MaxLengthValidator(135)]
    )

    title = models.CharField(
        validators=[MinLengthValidator(5), MaxLengthValidator(60)]
    )

    class Meta:
        indexes = [
            models.Index(fields=['category']),
            models.Index(fields=['funding_amount']),
            models.Index(fields=['funding_end_date']),
        ]
    
    def __str__(self):
        return f"{self.id} - {self.title}"