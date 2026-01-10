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
def project_owner_fixture():
    return User.objects.create_user(
        name='Project Owner',
        email='projectowner@example.com',
        password='password123'
    )

@pytest.fixture
def project_fixture(project_owner_fixture):
    return Project.objects.create(
        title='View Test Project',
        short_blurb='This is a short blurb for a view test project.',
        description='This is a very very very long description for a view test project that definitely meets the minimum length requirements of 200 characters. This ensures our project fixture is valid for testing purposes and will not cause any validation errors during test setup.',
        funding_amount=1000,
        funding_end_date=timezone.now() + timedelta(days=30),
        image_url='http://example.com/view_project_image.jpg',
        category='Technology',
        user=project_owner_fixture
    )

@pytest.fixture
def reward_fixture(project_fixture):
    return Reward.objects.create(
        project=project_fixture,
        title='View Test Reward',
        description='A reward for view tests.',
        amount=10
    )

@pytest.fixture
def backing_fixture(user_fixture, reward_fixture):
    return Backing.objects.create(
        user=user_fixture,
        reward=reward_fixture
    )

@pytest.fixture
def create_url(project_fixture, reward_fixture):
    return reverse('backing', kwargs={'project_id': project_fixture.id, 'reward_id': reward_fixture.id})


@pytest.mark.django_db
def test_post_backing_success(auth_client, create_url, user_fixture, reward_fixture):
    response = auth_client.post(create_url)
    assert response.status_code == status.HTTP_200_OK
    assert Backing.objects.count() == 1
    backing = Backing.objects.first()
    assert backing.user == user_fixture
    assert backing.reward == reward_fixture
    assert response.data['backing']['reward_id'] == reward_fixture.id
    assert response.data['backing']['user_id'] == user_fixture.id

@pytest.mark.django_db
def test_post_backing_unauthenticated(unauth_client, create_url):
    response = unauth_client.post(create_url)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

@pytest.mark.django_db
def test_post_backing_project_owner_backs_own_project(auth_client, project_fixture, reward_fixture, project_owner_fixture):
    # Authenticate as project owner
    auth_client.force_authenticate(user=project_owner_fixture)
    url = reverse('backing', kwargs={'project_id': project_fixture.id, 'reward_id': reward_fixture.id})
    response = auth_client.post(url)
    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert 'You can\'t back your own projects' in response.data[0]

@pytest.mark.django_db
def test_post_backing_already_backed_project(auth_client, create_url, backing_fixture):
    # backing_fixture already creates a backing for user_fixture and reward_fixture
    # So a second attempt should fail
    response = auth_client.post(create_url)
    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert 'You can\'t back a project again once you have already backed it' in response.data[0]
