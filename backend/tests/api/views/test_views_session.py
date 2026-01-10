import pytest
from rest_framework import status
from rest_framework.test import APIClient
from django.urls import reverse
from django.contrib.auth import get_user_model

User = get_user_model()

@pytest.fixture
def auth_client(user_fixture):
    client = APIClient()
    # Log in the user to get a token
    response = client.post(reverse('session'), {'user': {'email': user_fixture.email, 'password': 'password123'}}, format='json')
    client.credentials(HTTP_AUTHORIZATION='Bearer ' + response.data['token'])
    return client

@pytest.fixture
def unauth_client():
    return APIClient()

@pytest.fixture
def user_fixture():
    return User.objects.create_user(
        name='Test User',
        email='testsessionuser@example.com',
        password='password123'
    )

@pytest.fixture
def login_data():
    return {
        'user': {
            'email': 'testsessionuser@example.com',
            'password': 'password123'
        }
    }

@pytest.fixture
def invalid_login_data():
    return {
        'user': {
            'email': 'nonexistent@example.com',
            'password': 'wrongpassword'
        }
    }

@pytest.fixture
def logout_data(auth_client):
    # Get a refresh token for logout
    response = auth_client.post(reverse('session'), {'user': {'email': 'testsessionuser@example.com', 'password': 'password123'}}, format='json')
    return {'refresh': response.data['refresh']}


@pytest.mark.django_db
def test_post_session_login_success(unauth_client, user_fixture, login_data):
    response = unauth_client.post(reverse('session'), login_data, format='json')
    assert response.status_code == status.HTTP_200_OK
    assert 'token' in response.data
    assert 'refresh' in response.data
    assert response.data['user']['email'] == user_fixture.email

@pytest.mark.django_db
def test_post_session_login_invalid_credentials(unauth_client, invalid_login_data):
    response = unauth_client.post(reverse('session'), invalid_login_data, format='json')
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert 'Invalid email or password' in response.data[0]

@pytest.mark.django_db
def test_get_session_current_user_authenticated(auth_client, user_fixture):
    response = auth_client.get(reverse('session'))
    assert response.status_code == status.HTTP_200_OK
    assert response.data['id'] == user_fixture.id
    assert response.data['email'] == user_fixture.email
    assert response.data['name'] == user_fixture.name

@pytest.mark.django_db
def test_get_session_current_user_unauthenticated(unauth_client):
    response = unauth_client.get(reverse('session'))
    assert response.status_code == status.HTTP_200_OK # AllowAny permission, returns empty obj on error
    assert response.data == {}

@pytest.mark.django_db
def test_delete_session_logout_success(auth_client, logout_data):
    response = auth_client.delete(reverse('session'), logout_data, format='json')
    assert response.status_code == status.HTTP_200_OK
    assert response.data == {}

@pytest.mark.django_db
def test_delete_session_logout_unauthenticated(unauth_client, logout_data):
    response = unauth_client.delete(reverse('session'), logout_data, format='json')
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
