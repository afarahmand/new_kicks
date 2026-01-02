import pytest
from django.utils import timezone
from datetime import timedelta
from api.models.user import User
from api.models.project import Project
from api.models.reward import Reward
from api.models.backing import Backing

@pytest.fixture
def user_data():
    """Basic user data for testing"""
    return {
        'email': 'test@example.com',
        'name': 'Test User',
        'password': 'securepassword123'
    }

@pytest.fixture
def user(db, user_data):
    """Create a test user"""
    return User.objects.create_user(**user_data)

@pytest.fixture
def another_user(db):
    """Create another test user"""
    return User.objects.create_user(
        email='another@example.com',
        name='Another User',
        password='password123'
    )


@pytest.fixture
def project_data(user):
    """Basic project data for testing"""
    return {
        'user': user,
        'category': 'Technology',
        'description': 'A' * 200,  # Min 200 chars
        'funding_amount': 10000,
        'funding_end_date': timezone.now() + timedelta(days=30),
        'image_url': 'https://example.com/image.jpg',
        'short_blurb': 'This is a test project blurb that is long enough',
        'title': 'Test Project Title'
    }

@pytest.fixture
def project(db, project_data):
    """Create a test project"""
    return Project.objects.create(**project_data)


@pytest.fixture
def reward_data(project):
    """Basic reward data for testing"""
    return {
        'project': project,
        'amount': 50,
        'description': 'Test reward description',
        'title': 'Test Reward'
    }

@pytest.fixture
def reward(db, reward_data):
    """Create a test reward"""
    return Reward.objects.create(**reward_data)


@pytest.fixture
def backing_data(another_user, reward):
    """Basic backing data for testing"""
    return {
        'user': another_user,
        'reward': reward
    }

@pytest.fixture
def backing(db, backing_data):
    """Create a test backing"""
    return Backing.objects.create(**backing_data)