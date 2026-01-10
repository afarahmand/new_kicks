import pytest
from rest_framework import status
from rest_framework.test import APIClient
from django.urls import reverse
from django.utils import timezone
from datetime import timedelta

from api.models.user import User
from api.models.project import Project
from api.models.reward import Reward

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
        email='rewardviewuser@example.com',
        password='password123'
    )

@pytest.fixture
def other_user_fixture():
    return User.objects.create_user(
        name='Other User',
        email='otherrewardsviewuser@example.com',
        password='password123'
    )

@pytest.fixture
def project_owner_fixture():
    return User.objects.create_user(
        name='Project Owner',
        email='rewardsviewowner@example.com',
        password='password123'
    )

@pytest.fixture
def project_fixture(project_owner_fixture):
    return Project.objects.create(
        title='Rewards View Test Project',
        short_blurb='Short blurb for rewards view test project. 20 chars.',
        description='x'*200,
        funding_amount=1000,
        funding_end_date=timezone.now() + timedelta(days=30),
        image_url='http://example.com/rewards_view_project.jpg',
        category='Film',
        user=project_owner_fixture
    )

@pytest.fixture
def reward_data(project_fixture):
    return {
        'reward': {
            'title': 'New Reward Title',
            'description': 'A new reward from the rewards view.',
            'amount': 50,
            'project_id': project_fixture.id
        }
    }

@pytest.fixture
def create_url(project_fixture):
    return reverse('rewards', kwargs={'project_id': project_fixture.id})


@pytest.mark.django_db
def test_post_reward_success(auth_client, create_url, project_owner_fixture, reward_data):
    auth_client.force_authenticate(user=project_owner_fixture) # Project owner creating a reward
    response = auth_client.post(create_url, reward_data, format='json')
    assert response.status_code == status.HTTP_200_OK
    assert Reward.objects.count() == 1 # Only one from this test
    created_reward = Reward.objects.first()
    assert created_reward.title == reward_data['reward']['title']
    assert created_reward.project.id == reward_data['reward']['project_id']

@pytest.mark.django_db
def test_post_reward_unauthenticated(unauth_client, create_url, reward_data):
    response = unauth_client.post(create_url, reward_data, format='json')
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

@pytest.mark.django_db
def test_post_reward_not_project_owner(auth_client, create_url, reward_data, other_user_fixture):
    auth_client.force_authenticate(user=other_user_fixture) # Other user tries to create a reward
    response = auth_client.post(create_url, reward_data, format='json')
    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert 'Cannot create rewards for projects that were not created by you' in response.data[0]

@pytest.mark.django_db
def test_post_reward_non_existent_project(auth_client, reward_data, user_fixture):
    auth_client.force_authenticate(user=user_fixture)
    url = reverse('rewards', kwargs={'project_id': 99999})
    response = auth_client.post(url, reward_data, format='json')
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert 'Cannot create rewards for projects that do not exist' in response.data[0]

@pytest.mark.django_db
def test_post_reward_invalid_data(auth_client, create_url, project_owner_fixture):
    auth_client.force_authenticate(user=project_owner_fixture)
    invalid_data = {
        'reward': {
            'amount': 0 # Less than 1
        }
    }
    response = auth_client.post(create_url, invalid_data, format='json')
    assert response.status_code == status.HTTP_404_NOT_FOUND # The view returns 404 for serializer errors
    assert 'amount' in response.data[0]
    assert 'Ensure this value is greater than or equal to 1.' in response.data[0]
