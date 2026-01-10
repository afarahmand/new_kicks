import pytest
from rest_framework import status
from rest_framework.test import APIClient
from django.urls import reverse
from api.models.user import User

@pytest.fixture
def client():
    return APIClient()

@pytest.fixture
def valid_user_data():
    return {
        'user': {
            'email': 'newuser@example.com',
            'name': 'New User',
            'password': 'newpassword123'
        }
    }

@pytest.fixture
def existing_user_fixture():
    return User.objects.create_user(
        name='Existing User',
        email='existing@example.com',
        password='existingpassword'
    )

@pytest.mark.django_db
def test_post_user_success(client, valid_user_data):
    url = reverse('users')
    response = client.post(url, valid_user_data, format='json')
    assert response.status_code == status.HTTP_200_OK
    assert User.objects.count() == 1
    created_user = User.objects.first()
    assert created_user.email == valid_user_data['user']['email']
    assert created_user.name == valid_user_data['user']['name']
    assert created_user.check_password(valid_user_data['user']['password'])
    assert response.data['email'] == valid_user_data['user']['email']
    assert response.data['name'] == valid_user_data['user']['name']

@pytest.mark.django_db
def test_post_user_invalid_data_missing_email(client):
    url = reverse('users')
    invalid_data = {
        'user': {
            'name': 'Missing Email',
            'password': 'password123'
        }
    }
    response = client.post(url, invalid_data, format='json')
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    print(response.data)
    assert 'email' in response.data[0]
    assert 'This field is required.' in response.data[0]

@pytest.mark.django_db
def test_post_user_invalid_data_email_already_exists(client, existing_user_fixture, valid_user_data):
    url = reverse('users')
    data_with_existing_email = valid_user_data.copy()
    data_with_existing_email['user']['email'] = existing_user_fixture.email
    response = client.post(url, data_with_existing_email, format='json')
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert 'email' in response.data[0]
    assert 'user with this email already exists.' in response.data[0]

@pytest.mark.django_db
def test_post_user_invalid_data_missing_name(client):
    url = reverse('users')
    invalid_data = {
        'user': {
            'email': 'missingname@example.com',
            'password': 'password123'
        }
    }
    response = client.post(url, invalid_data, format='json')
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert 'name' in response.data[0]
    assert 'This field is required.' in response.data[0]

@pytest.mark.django_db
def test_post_user_invalid_data_missing_password(client):
    url = reverse('users')
    invalid_data = {
        'user': {
            'email': 'missingpassword@example.com',
            'name': 'Missing Password'
        }
    }
    response = client.post(url, invalid_data, format='json')
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert 'password' in response.data[0]
    assert 'This field is required.' in response.data[0]
