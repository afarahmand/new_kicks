from datetime import timedelta
from django.core.exceptions import ValidationError
from django.core.validators import MaxLengthValidator, MinLengthValidator, MinValueValidator
from django.db import connection, models
from django.utils import timezone

from .user import User
from ..mixins.timestamps import TimestampMixin
from ..mixins.validate_on_save import ValidateOnSaveMixin

def validate_max_date(value):
    max_date = timezone.now() + timedelta(days=365)

    if value > max_date:
        raise ValidationError(f"The funding end date must be less than one year away")

def validate_min_date(value):
    if value < timezone.now():
        raise ValidationError(f"The funding end date must be in the future")

class Project(TimestampMixin, ValidateOnSaveMixin, models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='projects'
    )
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

    @property
    def backings(self):
        from .backing import Backing
        return Backing.objects.filter(reward__project=self)

    @property
    def creator(self):
        return self.user

    def percentage_funded(self):
        """
        Calculate percentage funded for a specific project using raw SQL
        """
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT SUM(backings_per_reward) AS amount_funded
                FROM (
                    SELECT project_id, COUNT(api_backing.id)*api_reward.amount AS backings_per_reward
                    FROM api_backing
                    INNER JOIN api_reward ON api_backing.reward_id=api_reward.id
                    INNER JOIN api_project ON api_reward.project_id=api_project.id
                    GROUP BY api_reward.id
                    HAVING project_id=%s
                ) AS derivedTable
            """, [self.id])

            amount_funded = cursor.fetchone()[0]

        if self.funding_amount and amount_funded:
            percentage = (amount_funded / self.funding_amount) * 100
            return round(percentage, 2)
        return 0
    
    @classmethod
    def projects_percentage_funded(cls):
        """
        Simplified version assuming funding_amount is always > 0
        """
        # Get funded amounts
        funded_dict = {}
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT SUM(backings_per_reward) AS amount_funded, project_id
                FROM (
                    SELECT project_id, COUNT(api_backing.id)*api_reward.amount AS backings_per_reward
                    FROM api_backing
                    INNER JOIN api_reward ON api_backing.reward_id=api_reward.id
                    GROUP BY api_reward.id
                ) AS derivedTable
                GROUP BY project_id
            """)
            
            for amount, project_id in cursor.fetchall():
                funded_dict[project_id] = float(amount or 0)
        
        # Calculate percentages for all projects
        result = {}
        for project in cls.objects.all():
            amount_funded = funded_dict.get(project.id, 0.0)
            # funding_amount must be > 0
            percentage = (100 * amount_funded) / float(project.funding_amount)
            result[project.id] = round(percentage, 2)
        
        return result
    
    def __str__(self):
        return f"{self.id} - {self.title}"