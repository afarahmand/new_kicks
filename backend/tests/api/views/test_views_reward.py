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
        email='rewardviewtestuser@example.com',
        password='password123'
    )

@pytest.fixture
def other_user_fixture():
    return User.objects.create_user(
        name='Other User',
        email='otherrewardviewuser@example.com',
        password='password123'
    )

@pytest.fixture
def project_owner_fixture():
    return User.objects.create_user(
        name='Project Owner',
        email='rewardviewowner@example.com',
        password='password123'
    )

@pytest.fixture
def project_fixture(project_owner_fixture):
    return Project.objects.create(
        title='Reward View Test Project',
        short_blurb='This is a short blurb for a reward view test project. 20 chars.',
        description='x'*200,
        funding_amount=1000,
        funding_end_date=timezone.now() + timedelta(days=30),
        image_url='http://example.com/reward_view_project.jpg',
        category='Games',
        user=project_owner_fixture
    )

@pytest.fixture
def reward_fixture(project_fixture):
    return Reward.objects.create(
        project=project_fixture,
        title='Test Reward',
        description='A descriptive reward for testing.',
        amount=10
    )

@pytest.fixture
def delete_url(project_fixture, reward_fixture):
    return reverse('reward', kwargs={'project_id': project_fixture.id, 'reward_id': reward_fixture.id})

@pytest.fixture
def patch_url(project_fixture, reward_fixture):
    return reverse('reward', kwargs={'project_id': project_fixture.id, 'reward_id': reward_fixture.id})


@pytest.mark.django_db
def test_delete_reward_success(auth_client, delete_url, project_owner_fixture, reward_fixture):
    auth_client.force_authenticate(user=project_owner_fixture) # Project owner deleting their own reward
    response = auth_client.delete(delete_url)
    assert response.status_code == status.HTTP_200_OK
    assert not Reward.objects.filter(id=reward_fixture.id).exists()
    assert response.data['reward']['id'] == reward_fixture.id

@pytest.mark.django_db
def test_delete_reward_unauthenticated(unauth_client, delete_url):
    response = unauth_client.delete(delete_url)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

@pytest.mark.django_db
def test_delete_reward_not_owner(auth_client, delete_url, other_user_fixture):
    auth_client.force_authenticate(user=other_user_fixture)
    response = auth_client.delete(delete_url)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert 'Cannot delete rewards for projects that were not created by you' in response.data[0]

@pytest.mark.django_db
def test_delete_reward_not_found(auth_client, project_fixture, project_owner_fixture):
    auth_client.force_authenticate(user=project_owner_fixture)
    url = reverse('reward', kwargs={'project_id': project_fixture.id, 'reward_id': 99999})
    response = auth_client.delete(url)
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert 'Deletion failed. Reward not found' in response.data[0]

@pytest.mark.django_db
def test_patch_reward_success(auth_client, patch_url, project_owner_fixture, reward_fixture):
    auth_client.force_authenticate(user=project_owner_fixture)
    updated_data = {'title': 'Updated Reward Title', 'amount': 15}
    response = auth_client.patch(patch_url, updated_data, format='json')
    reward_fixture.refresh_from_db()
    assert response.status_code == status.HTTP_200_OK
    assert reward_fixture.title == 'Updated Reward Title'
    assert reward_fixture.amount == 15
    assert response.data['reward']['title'] == 'Updated Reward Title'
    assert response.data['reward']['amount'] == 15

@pytest.mark.django_db
def test_patch_reward_unauthenticated(unauth_client, patch_url):
    response = unauth_client.patch(patch_url, {'title': 'Unauthorized'}, format='json')
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

@pytest.mark.django_db
def test_patch_reward_not_owner(auth_client, patch_url, other_user_fixture):
    auth_client.force_authenticate(user=other_user_fixture)
    response = auth_client.patch(patch_url, {'title': 'Not Owner'}, format='json')
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert 'Cannot delete rewards for projects that were not created by you' in response.data[0]

@pytest.mark.django_db
def test_patch_reward_not_found(auth_client, project_fixture, project_owner_fixture):
    auth_client.force_authenticate(user=project_owner_fixture)
    url = reverse('reward', kwargs={'project_id': project_fixture.id, 'reward_id': 99999})
    response = auth_client.patch(url, {'title': 'Not Found'}, format='json')
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert 'Update failed. Reward not found' in response.data[0]

@pytest.mark.django_db
def test_patch_reward_invalid_data(auth_client, patch_url, project_owner_fixture):
    auth_client.force_authenticate(user=project_owner_fixture)
    invalid_data = {'amount': 0} # Less than 1
    response = auth_client.patch(patch_url, invalid_data, format='json')
    assert response.status_code == status.HTTP_404_NOT_FOUND # The view returns 404 for serializer errors
    assert 'amount' in response.data[0]
    assert 'Ensure this value is greater than or equal to 1.' in response.data[0]
