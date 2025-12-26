# from django.core.exceptions import ValidationError
from django.db import models

from .reward import Reward
from .user import User
from ..mixins.timestamps import TimestampMixin
from ..mixins.validate_on_save import ValidateOnSaveMixin

class Backing(TimestampMixin, ValidateOnSaveMixin, models.Model):
    # def validate_backer_not_project_creator(value):
    #     if hasattr(self, 'reward') and self.reward and self.reward.project:
    #         if value == self.reward.project.user:
    #             raise ValidationError("User cannot be the same as the project owner.")
            
    reward = models.ForeignKey(Reward, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    # validators=[validate_backer_not_project_creator]

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'reward'], 
                name='unique_user_reward'
            ),
        ]
        indexes = [
            models.Index(fields=['user', 'reward']),
        ]

    def __str__(self):
        return f"{self.id} ${self.reward.amount}"
    
    # def clean(self):
    #     validate_backer_not_project_creator(self.user)
    #     super().clean()