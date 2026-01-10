import pytest
from rest_framework.exceptions import ValidationError
from api.serializers.session import SessionSerializer
from api.models.user import User

@pytest.fixture
def user_data():
    return {
        'email': 'test@example.com',
        'password': 'strong_password'
    }

@pytest.fixture
def user_fixture(user_data):
    return User.objects.create_user(
        name='Test User',
        email=user_data['email'],
        password=user_data['password']
    )

@pytest.mark.django_db
def test_session_serializer_valid_data(user_data):
    serializer = SessionSerializer(data=user_data)
    assert serializer.is_valid(raise_exception=True)
    assert serializer.validated_data['email'] == user_data['email']
    assert serializer.validated_data['password'] == user_data['password']

@pytest.mark.django_db
def test_session_serializer_missing_email():
    data = {
        'password': 'strong_password'
    }
    serializer = SessionSerializer(data=data)
    assert not serializer.is_valid()
    assert 'email' in serializer.errors
    assert 'This field is required.' in str(serializer.errors['email'][0])

@pytest.mark.django_db
def test_session_serializer_missing_password():
    data = {
        'email': 'test@example.com'
    }
    serializer = SessionSerializer(data=data)
    assert not serializer.is_valid()
    assert 'password' in serializer.errors
    assert 'This field is required.' in str(serializer.errors['password'][0])

@pytest.mark.django_db
def test_session_serializer_invalid_email_format():
    data = {
        'email': 'invalid-email',
        'password': 'strong_password'
    }
    serializer = SessionSerializer(data=data)
    assert not serializer.is_valid()
    assert 'email' in serializer.errors
    assert 'Enter a valid email address.' in str(serializer.errors['email'][0])
