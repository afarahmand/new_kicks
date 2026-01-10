from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.db import models
from ..mixins.timestamps import TimestampMixin
from ..mixins.validate_on_save import ValidateOnSaveMixin

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

class User(TimestampMixin, ValidateOnSaveMixin, AbstractBaseUser):
    REQUIRED_FIELDS = ['name']
    USERNAME_FIELD = 'email'

    email = models.EmailField(null=False, unique=True)
    image_url = models.CharField(null=False, default="https://i.imgur.com/rfxjQeS.png")
    name = models.CharField(null=False)

    objects = UserManager()

    class Meta:
        indexes = [
            models.Index(fields=['email']),
        ]

    @property
    def backed_projects(self):
        from .project import Project
        return Project.objects.filter(rewards__backings__user=self).distinct()
    
    @property
    def rewards(self):
        from .reward import Reward
        return Reward.objects.filter(backings__user=self)

    def __str__(self):
        return f"{self.id} - {self.name} - {self.email}"