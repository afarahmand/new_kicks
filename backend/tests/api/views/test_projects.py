import pytest
from rest_framework import status
from rest_framework.test import APIClient
from django.urls import reverse
from django.utils import timezone
from datetime import timedelta

from api.models.user import User
from api.models.project import Project
from api.models.reward import Reward
from api.serializers.project import ProjectSerializer

@pytest.fixture
def auth_client(user_fixture):
    client = APIClient()
    client.force_authenticate(user=user_fixture)
    return client

@pytest.fixture
def unauth_client():
    return APIClient()

@pytest.fixture
def user_fixture():
    return User.objects.create_user(
        name='Test User',
        email='testuser@example.com',
        password='password123'
    )

@pytest.fixture
def project_data(user_fixture):
    return {
        'project': {
            'title': 'New Project for ProjectsView',
            'short_blurb': 'This is a brand new project for testing the create endpoint. It has to be 20 chars long.',
            'description': 'x'*250, # Simplified to guarantee length
            'funding_amount': 2000,
            'funding_end_date': (timezone.now() + timedelta(days=90)).isoformat().replace('+00:00', 'Z'),
            'image_url': 'http://example.com/new_project.jpg',
            'category': 'Film',
            'user_id': user_fixture.id, # This is usually handled by context, but for simplified data dict
        }
    }

@pytest.fixture
def create_projects_for_index(user_fixture):
    # Create multiple projects for testing GET (index) method
    Project.objects.create(
        title='Index Project 1',
        short_blurb='Short blurb for index project 1: 20 chars.',
        description="""This is a super extremely very very very long description for Index Project 1 to meet the minimum length requirement of 200 characters. This ensures that the generated project data is always valid for testing purposes. It must be long enough!""",
        funding_amount=100,
        funding_end_date=timezone.now() + timedelta(days=10),
        image_url='http://example.com/index1.jpg',
        category='Art',
        user=user_fixture
    )
    Project.objects.create(
        title='Index Project 2',
        short_blurb='Short blurb for index project 2: 20 chars.',
        description="""This is a super extremely very very very long description for Index Project 2 to meet the minimum length requirement of 200 characters. This ensures that the generated project data is always valid for testing purposes. It must be long enough!""",
        funding_amount=200,
        funding_end_date=timezone.now() + timedelta(days=20),
        image_url='http://example.com/index2.jpg',
        category='Technology',
        user=user_fixture
    )

@pytest.mark.django_db
def test_get_projects_success(client, create_projects_for_index, user_fixture):
    url = reverse('projects')
    response = client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert 'projects' in response.data
    assert 'users' in response.data
    assert len(response.data['projects']) == 2
    assert len(response.data['users']) >= 1 # At least the user_fixture

    # Check that percentage_funded is present
    for project_id, project_data in response.data['projects'].items():
        assert 'percentage_funded' in project_data
        assert isinstance(project_data['percentage_funded'], float)

@pytest.mark.django_db
def test_post_project_success(auth_client, project_data):
    url = reverse('projects')
    response = auth_client.post(url, project_data, format='json')
    assert response.status_code == status.HTTP_200_OK
    assert Project.objects.count() == 1 # Only one from this test
    created_project = Project.objects.first()
    assert created_project.title == project_data['project']['title']
    assert created_project.user.id == project_data['project']['user_id']

@pytest.mark.django_db
def test_post_project_unauthenticated(unauth_client, project_data):
    url = reverse('projects')
    response = unauth_client.post(url, project_data, format='json')
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

@pytest.mark.django_db
def test_post_project_invalid_data(auth_client, user_fixture):
    url = reverse('projects')
    invalid_data = {
        'project': {
            'title': 'bad', # Too short
            'short_blurb': 'short', # Too short
            'description': 'too little', # Too short
            'funding_amount': 0, # Less than 1
            'funding_end_date': (timezone.now() - timedelta(days=1)).isoformat().replace('+00:00', 'Z'), # In the past
            'image_url': 'not-a-url',
            'category': 'Invalid',
            'user_id': user_fixture.id
        }
    }
    response = auth_client.post(url, invalid_data, format='json')
    assert response.status_code == status.HTTP_401_UNAUTHORIZED # The view returns 401 for serializer errors
    assert 'title' in response.data[0]
    assert 'short_blurb' in response.data[0]
    assert 'description' in response.data[0]
    assert 'funding_amount' in response.data[0]
    assert 'funding_end_date' in response.data[0]
    assert 'image_url' in response.data[0]
    assert 'category' in response.data[0]
