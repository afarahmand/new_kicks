import pytest
from django.core.exceptions import ValidationError
from django.utils import timezone
from datetime import timedelta
from api.models.user import User
from api.models.project import Project
from api.models.reward import Reward
from api.models.backing import Backing

@pytest.mark.django_db
class TestProjectModel:
    """Test Project model functionality"""
    
    def test_create_project(self, project_data):
        """Test creating a project with valid data"""
        project = Project.objects.create(**project_data)
        assert project.id is not None
        assert project.title == project_data['title']
        assert project.user == project_data['user']
    
    def test_valid_categories(self, project_data):
        """Test all valid category choices"""
        valid_categories = ['Art', 'Fashion', 'Film', 'Food', 'Games', 'Technology']
        
        for category in valid_categories:
            project_data['category'] = category
            project = Project.objects.create(**project_data)
            assert project.category == category
            project.delete()
    
    def test_creator_property(self, project):
        """Test creator property returns project user"""
        assert project.creator == project.user
    
    def test_backings_property(self, project, another_user):
        """Test backings property returns all project backings"""
        reward = Reward.objects.create(
            project=project,
            amount=50,
            title='Test Reward',
            description='Test'
        )
        backing = Backing.objects.create(user=another_user, reward=reward)
        
        backings = project.backings
        assert backing in backings
        assert backings.count() == 1
    
    def test_str_representation(self, project):
        """Test string representation of project"""
        expected = f"{project.id} - {project.title}"
        assert str(project) == expected

@pytest.mark.django_db
class TestPercentageFunded:
    """Test percentage_funded functionality"""
    
    def test_percentage_funded_no_backings(self, project):
        """Test percentage funded with no backings"""
        percentage = project.percentage_funded()
        assert percentage == 0
    
    def test_percentage_funded_single_backing(self, project, another_user):
        """Test percentage funded with one backing"""
        # Project funding amount is 10000
        reward = Reward.objects.create(
            project=project,
            amount=1000,
            title='Test',
            description='Test'
        )
        Backing.objects.create(user=another_user, reward=reward)
        
        percentage = project.percentage_funded()
        assert percentage == 10.0  # 1000/10000 * 100
    
    def test_percentage_funded_multiple_backings(self, project, another_user):
        """Test percentage funded with multiple backings"""
        reward1 = Reward.objects.create(
            project=project, amount=2000, title='R1', description='T'
        )
        reward2 = Reward.objects.create(
            project=project, amount=3000, title='R2', description='T'
        )
        
        Backing.objects.create(user=another_user, reward=reward1)
        
        # Create another user for second backing
        user3 = User.objects.create_user(
            email='user3@example.com',
            name='User 3',
            password='pass'
        )
        Backing.objects.create(user=user3, reward=reward2)
        
        percentage = project.percentage_funded()
        assert percentage == 50.0  # 5000/10000 * 100
    
    def test_percentage_funded_over_100(self, project, another_user):
        """Test percentage funded when overfunded"""
        reward = Reward.objects.create(
            project=project,
            amount=15000,
            title='Big Reward',
            description='Test'
        )
        Backing.objects.create(user=another_user, reward=reward)
        
        percentage = project.percentage_funded()
        assert percentage == 150.0
    
@pytest.mark.django_db
class TestProjectsPercentageFunded:
    """Test percentage_funded functionality"""
    
    def test_projects_percentage_funded_no_backings(self, project):
        """Test percentage funded with no backings"""
        percentage = Project.projects_percentage_funded()
        assert percentage == {project.id: 0}
    
    def test_projects_percentage_funded_single_backing(self, project, another_user):
        """Test percentage funded with one backing"""
        # Project funding amount is 10000
        reward = Reward.objects.create(
            project=project,
            amount=1000,
            title='Test',
            description='Test'
        )
        Backing.objects.create(user=another_user, reward=reward)
        
        percentage = Project.projects_percentage_funded()
        assert percentage == {project.id: 10.0}  # 1000/10000 * 100
    
    def test_projects_percentage_funded_multiple_backings(self, project, another_user):
        """Test percentage funded with multiple backings"""
        reward1 = Reward.objects.create(
            project=project, amount=2000, title='R1', description='T'
        )
        reward2 = Reward.objects.create(
            project=project, amount=3000, title='R2', description='T'
        )
        
        Backing.objects.create(user=another_user, reward=reward1)
        
        # Create another user for second backing
        user3 = User.objects.create_user(
            email='user3@example.com',
            name='User 3',
            password='pass'
        )
        Backing.objects.create(user=user3, reward=reward2)
        
        percentage = Project.projects_percentage_funded()
        assert percentage == {project.id: 50.0}  # 5000/10000 * 100
    
    def test_projects_percentage_funded_over_100(self, project, another_user):
        """Test percentage funded when overfunded"""
        reward = Reward.objects.create(
            project=project,
            amount=15000,
            title='Big Reward',
            description='Test'
        )
        Backing.objects.create(user=another_user, reward=reward)
        
        percentage = Project.projects_percentage_funded()
        assert percentage == {project.id: 150.0}
    
    def test_projects_percentage_funded_class_method(self, user):
        """Test class method percentage_funded for all projects"""
        # Create two projects with different funding
        project1 = Project.objects.create(
            user=user,
            category='Technology',
            description='A' * 200,
            funding_amount=10000,
            funding_end_date=timezone.now() + timedelta(days=30),
            image_url='https://example.com/img.jpg',
            short_blurb='Test blurb that is long enough',
            title='Project One'
        )
        
        project2 = Project.objects.create(
            user=user,
            category='Art',
            description='B' * 200,
            funding_amount=5000,
            funding_end_date=timezone.now() + timedelta(days=30),
            image_url='https://example.com/img2.jpg',
            short_blurb='Another test blurb for testing',
            title='Project Two'
        )
        
        # Add backings
        another_user = User.objects.create_user(
            email='backer@example.com',
            name='Backer',
            password='pass'
        )
        
        reward1 = Reward.objects.create(
            project=project1, amount=5000, title='R1', description='T'
        )
        reward2 = Reward.objects.create(
            project=project2, amount=2500, title='R2', description='T'
        )
        
        Backing.objects.create(user=another_user, reward=reward1)
        Backing.objects.create(user=another_user, reward=reward2)
        
        percentages = Project.projects_percentage_funded()
        
        assert percentages[project1.id] == 50.0
        assert percentages[project2.id] == 50.0

@pytest.mark.django_db
class TestProjectValidation:
    """Test project validation rules"""

    def test_description_min_length(self, project_data):
        """Test description must be at least 200 characters"""
        project_data['description'] = 'Too short'
        project = Project(**project_data)
        
        with pytest.raises(ValidationError) as exc_info:
            project.save()
        
        assert 'description' in exc_info.value.error_dict
    
    def test_funding_amount_positive(self, project_data):
        """Test funding amount must be positive"""
        project_data['funding_amount'] = 0
        project = Project(**project_data)
        
        with pytest.raises(ValidationError) as exc_info:
            project.save()
        
        assert 'funding_amount' in exc_info.value.error_dict
    
    def test_funding_end_date_in_future(self, project_data):
        """Test funding end date must be in the future"""
        project_data['funding_end_date'] = timezone.now() - timedelta(days=1)
        project = Project(**project_data)
        
        with pytest.raises(ValidationError) as exc_info:
            project.save()
        
        assert 'funding_end_date' in exc_info.value.error_dict
    
    def test_funding_end_date_max_one_year(self, project_data):
        """Test funding end date cannot be more than a year away"""
        project_data['funding_end_date'] = timezone.now() + timedelta(days=366)
        project = Project(**project_data)
        
        with pytest.raises(ValidationError) as exc_info:
            project.save()
        
        assert 'funding_end_date' in exc_info.value.error_dict
    
    def test_short_blurb_min_length(self, project_data):
        """Test short blurb must be at least 20 characters"""
        project_data['short_blurb'] = 'Too short'
        project = Project(**project_data)
        
        with pytest.raises(ValidationError) as exc_info:
            project.save()
        
        assert 'short_blurb' in exc_info.value.error_dict
    
    def test_short_blurb_max_length(self, project_data):
        """Test short blurb cannot exceed 135 characters"""
        project_data['short_blurb'] = 'x' * 136
        project = Project(**project_data)
        
        with pytest.raises(ValidationError) as exc_info:
            project.save()
        
        assert 'short_blurb' in exc_info.value.error_dict
    
    def test_title_min_length(self, project_data):
        """Test title must be at least 5 characters"""
        project_data['title'] = 'Test'
        project = Project(**project_data)
        
        with pytest.raises(ValidationError) as exc_info:
            project.save()
        
        assert 'title' in exc_info.value.error_dict
    
    def test_title_max_length(self, project_data):
        """Test title cannot exceed 60 characters"""
        project_data['title'] = 'x' * 61
        project = Project(**project_data)
        
        with pytest.raises(ValidationError) as exc_info:
            project.save()
        
        assert 'title' in exc_info.value.error_dict