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
def client():
    return APIClient()

@pytest.fixture
def user_data():
    return {
        'name': 'Test User',
        'email': 'userviewtest@example.com',
        'password': 'password123'
    }

@pytest.fixture
def user_fixture(user_data):
    return User.objects.create_user(
        name=user_data['name'],
        email=user_data['email'],
        password=user_data['password']
    )

@pytest.fixture
def other_user_fixture():
    return User.objects.create_user(
        name='Other User',
        email='otheruserview@example.com',
        password='password123'
    )

@pytest.fixture
def project_owner_fixture():
    return User.objects.create_user(
        name='Project Owner',
        email='userviewowner@example.com',
        password='password123'
    )

@pytest.fixture
def setup_user_data(user_fixture, project_owner_fixture, other_user_fixture):
    # Project created by project_owner_fixture
    project1 = Project.objects.create(
        title='User Created Project 1',
        short_blurb='Short blurb for user project 1. At least 20 chars.',
        description='x'*200,
        funding_amount=100,
        funding_end_date=timezone.now() + timedelta(days=10),
        image_url='http://example.com/user_project1.jpg',
        category='Art',
        user=project_owner_fixture
    )
    reward1 = Reward.objects.create(
        project=project1,
        title='Reward 1 for Project 1',
        description='Description for reward 1.',
        amount=10
    )
    # User backs project1
    Backing.objects.create(user=user_fixture, reward=reward1)

    # Project created by user_fixture
    project2 = Project.objects.create(
        title='Backed Project by User',
        short_blurb='Short blurb for project backed by user. At least 20 chars.',
        description='x'*200,
        funding_amount=500,
        funding_end_date=timezone.now() + timedelta(days=20),
        image_url='http://example.com/user_project2.jpg',
        category='Technology',
        user=user_fixture
    )
    reward2 = Reward.objects.create(
        project=project2,
        title='Reward 2 for Project 2',
        description='Description for reward 2.',
        amount=50
    )
    return {'user_fixture': user_fixture, 'project1': project1, 'reward1': reward1, 'project2': project2, 'reward2': reward2}

@pytest.mark.django_db
def test_get_user_success(client, user_fixture, setup_user_data):
    url = reverse('user', kwargs={'user_id': user_fixture.id})
    response = client.get(url)
    assert response.status_code == status.HTTP_200_OK

    # Check user data
    assert response.data['user']['id'] == user_fixture.id
    assert response.data['user']['email'] == user_fixture.email
    assert response.data['user']['name'] == user_fixture.name

    # Check backed projects
    assert len(response.data['backed_projects']) == 1
    assert str(setup_user_data['project1'].id) in response.data['backed_projects']
    assert response.data['backed_projects'][str(setup_user_data['project1'].id)]['title'] == setup_user_data['project1'].title

    # Check created projects
    assert len(response.data['created_projects']) == 1
    assert str(setup_user_data['project2'].id) in response.data['created_projects']
    assert response.data['created_projects'][str(setup_user_data['project2'].id)]['title'] == setup_user_data['project2'].title

    # Check backings
    assert len(response.data['backings']) == 1
    backing = Backing.objects.get(user=user_fixture, reward=setup_user_data['reward1'])
    assert str(backing.id) in response.data['backings']

    # Check rewards
    assert len(response.data['rewards']) == 1
    assert str(setup_user_data['reward1'].id) in response.data['rewards']


@pytest.mark.django_db
def test_get_user_not_found(client):
    url = reverse('user', kwargs={'user_id': 99999})
    response = client.get(url)
    assert response.status_code == status.HTTP_404_NOT_FOUND
