import pytest
from django.core.exceptions import ValidationError
from api.models.project import Project

@pytest.mark.django_db
class TestValidateOnSaveMixin:
    """Test ValidateOnSaveMixin functionality"""
    
    def test_validation_runs_on_save(self, project_data):
        """Test that full_clean is called on save"""
        # Create project with invalid data (title too short)
        project_data['title'] = 'Err'  # Less than 5 chars
        project = Project(**project_data)
        
        with pytest.raises(ValidationError) as exc_info:
            project.save()
        
        assert 'title' in exc_info.value.error_dict
    
    def test_valid_data_saves_successfully(self, project_data):
        """Test that valid data saves without issues"""
        project = Project(**project_data)
        project.save()
        assert project.id is not None
    
    def test_validation_error_prevents_save(self, user, project_data):
        """Test that validation errors prevent database save"""
        project_data['funding_amount'] = -100  # Invalid
        project = Project(**project_data)
        
        initial_count = Project.objects.count()
        
        with pytest.raises(ValidationError):
            project.save()
        
        assert Project.objects.count() == initial_count