import pytest
from django.utils import timezone
from api.models.user import User

@pytest.mark.django_db
class TestTimestampMixin:
    """Test TimestampMixin functionality"""
    
    def test_created_at_auto_set(self, user_data):
        """Test that created_at is automatically set on creation"""
        user = User.objects.create_user(**user_data)
        assert user.created_at is not None
        assert user.created_at <= timezone.now()
    
    def test_updated_at_auto_set(self, user_data):
        """Test that updated_at is automatically set on creation"""
        user = User.objects.create_user(**user_data)
        assert user.updated_at is not None
        assert user.updated_at <= timezone.now()
    
    def test_updated_at_changes_on_save(self, user):
        """Test that updated_at changes when model is saved"""
        original_updated_at = user.updated_at
        user.name = 'Updated Name'
        user.save()
        assert user.updated_at > original_updated_at
    
    def test_created_at_does_not_change_on_save(self, user):
        """Test that created_at does not change on subsequent saves"""
        original_created_at = user.created_at
        user.name = 'Updated Name'
        user.save()
        assert user.created_at == original_created_at