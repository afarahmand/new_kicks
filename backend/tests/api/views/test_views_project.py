import pytest
from rest_framework import status
from rest_framework.test import APIClient
from django.urls import reverse
from django.utils import timezone
from datetime import timedelta

from api.models.user import User
from api.models.project import Project
from api.models.reward import Reward
from api.models.backing import Backing
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
def other_user_fixture():
    return User.objects.create_user(
        name='Other User',
        email='otheruser@example.com',
        password='password123'
    )

@pytest.fixture
def project_owner_fixture():
    return User.objects.create_user(
        name='Project Owner',
        email='projectowner@example.com',
        password='password123'
    )

@pytest.fixture
def project_fixture(project_owner_fixture):
    return Project.objects.create(
        title='Single Project View Test',
        short_blurb='A short blurb for a single project view test.',
        description="""This is a very very very long description for 'Single Project View Test' project, designed to easily exceed the minimum requirement of 200 characters. It is crucial that this description is sufficiently verbose to prevent any validation errors related to its length during the testing process. This extended text ensures full compliance with the Project model's validation rules for the description field. This verbose description ensures that creating a project instance via the serializer will pass validation. We are making sure that every detail is covered within the description to meet the minimum length requirements.""",
        funding_amount=1000,
        funding_end_date=timezone.now() + timedelta(days=30),
        image_url='http://example.com/project_view.jpg',
        category='Games',
        user=project_owner_fixture
    )

@pytest.fixture
def reward_fixture(project_fixture):
    return Reward.objects.create(
        project=project_fixture,
        title='Project View Reward',
        description='A reward for project view tests.',
        amount=10
    )

@pytest.fixture
def backing_fixture(user_fixture, reward_fixture):
    return Backing.objects.create(
        user=user_fixture,
        reward=reward_fixture
    )

@pytest.mark.django_db
def test_get_project_success(client, project_fixture, user_fixture, reward_fixture, backing_fixture):
    url = reverse('project', kwargs={'project_id': project_fixture.id})
    response = client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert response.data['project']['id'] == project_fixture.id
    assert response.data['project']['title'] == project_fixture.title
    assert response.data['user']['id'] == project_fixture.creator.id
    assert str(reward_fixture.id) in response.data['rewards']
    assert str(backing_fixture.id) in response.data['backings']

@pytest.mark.django_db
def test_get_project_not_found(client):
    url = reverse('project', kwargs={'project_id': 99999})
    response = client.get(url)
    assert response.status_code == status.HTTP_404_NOT_FOUND

@pytest.mark.django_db
def test_delete_project_success(auth_client, project_fixture, project_owner_fixture):
    # Authenticate as project owner
    auth_client.force_authenticate(user=project_owner_fixture)
    url = reverse('project', kwargs={'project_id': project_fixture.id})
    response = auth_client.delete(url)
    assert response.status_code == status.HTTP_200_OK
    assert not Project.objects.filter(id=project_fixture.id).exists()

@pytest.mark.django_db
def test_delete_project_unauthenticated(unauth_client, project_fixture):
    url = reverse('project', kwargs={'project_id': project_fixture.id})
    response = unauth_client.delete(url)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED # NoReverseMatch: Reverse for 'project'' not found. 'project' is not a valid view function or pattern name.

@pytest.mark.django_db
def test_delete_project_not_owner(auth_client, project_fixture, other_user_fixture):
    # Authenticate as a different user
    auth_client.force_authenticate(user=other_user_fixture)
    url = reverse('project', kwargs={'project_id': project_fixture.id})
    response = auth_client.delete(url)
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert 'Deletion failed. Project not found' in response.data[0]

@pytest.mark.django_db
def test_patch_project_success(auth_client, project_fixture, project_owner_fixture):
    # Authenticate as project owner
    auth_client.force_authenticate(user=project_owner_fixture)
    url = reverse('project', kwargs={'project_id': project_fixture.id})
    updated_data = {'title': 'Updated Project Title'}
    response = auth_client.patch(url, updated_data, format='json')
    project_fixture.refresh_from_db()
    assert response.status_code == status.HTTP_200_OK
    assert project_fixture.title == 'Updated Project Title'
    # The response should return the updated project data
    assert response.data['project']['title'] == 'Updated Project Title'

@pytest.mark.django_db
def test_patch_project_unauthenticated(unauth_client, project_fixture):
    url = reverse('project', kwargs={'project_id': project_fixture.id})
    updated_data = {'title': 'Unauthorized Update'}
    response = unauth_client.patch(url, updated_data, format='json')
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

@pytest.mark.django_db
def test_patch_project_not_owner(auth_client, project_fixture, other_user_fixture):
    # Authenticate as a different user
    auth_client.force_authenticate(user=other_user_fixture)
    url = reverse('project', kwargs={'project_id': project_fixture.id})
    updated_data = {'title': 'Not Owner Update'}
    response = auth_client.patch(url, updated_data, format='json')
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert 'Update failed. Project not found' in response.data[0]

@pytest.mark.django_db
def test_patch_project_invalid_data(auth_client, project_fixture, project_owner_fixture):
    # Authenticate as project owner
    auth_client.force_authenticate(user=project_owner_fixture)
    url = reverse('project', kwargs={'project_id': project_fixture.id})
    invalid_data = {'title': 'abc'} # Too short
    response = auth_client.patch(url, invalid_data, format='json')
    assert response.status_code == status.HTTP_401_UNAUTHORIZED # The view returns 401 for serializer errors
    assert 'title' in response.data[0]
    assert 'Ensure this field has at least 5 characters.' in response.data[0]
