from django.core.validators import MinValueValidator
from django.db import models

from .project import Project
from ..mixins.timestamps import TimestampMixin
from ..mixins.validate_on_save import ValidateOnSaveMixin

class Reward(TimestampMixin, ValidateOnSaveMixin, models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    amount = models.IntegerField(
        validators=[MinValueValidator(1)]
    )
    description = models.CharField(default="")
    title = models.CharField()

    def __str__(self):
        return f"{self.amount} {self.title}"