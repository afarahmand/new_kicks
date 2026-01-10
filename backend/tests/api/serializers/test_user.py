import pytest
from rest_framework.exceptions import ValidationError
from api.serializers.user import UserSerializer
from api.models.user import User

@pytest.fixture
def user_data():
    return {
        'email': 'testuser@example.com',
        'name': 'Test User',
        'password': 'strong_password123'
    }

@pytest.fixture
def user_fixture(user_data):
    return User.objects.create_user(
        email=user_data['email'],
        name=user_data['name'],
        password=user_data['password']
    )

@pytest.mark.django_db
def test_user_serializer_valid_serialization(user_fixture):
    serializer = UserSerializer(user_fixture)
    expected_data = {
        'id': user_fixture.id,
        'email': user_fixture.email,
        'name': user_fixture.name,
        'image_url': user_fixture.image_url # Default value
    }
    # Password should not be in serialized data
    assert 'password' not in serializer.data
    # Compare other fields
    for key, value in expected_data.items():
        assert serializer.data[key] == value

@pytest.mark.django_db
def test_user_serializer_valid_deserialization_create(user_data):
    serializer = UserSerializer(data=user_data)
    assert serializer.is_valid(raise_exception=True)
    user = serializer.save()

    assert user.email == user_data['email']
    assert user.name == user_data['name']
    assert user.check_password(user_data['password'])
    assert User.objects.count() == 1

@pytest.mark.django_db
def test_user_serializer_email_already_exists(user_fixture, user_data):
    data = user_data.copy()
    data['name'] = 'Another User' # Change name to avoid other unique constraint
    
    serializer = UserSerializer(data=data)

    assert not serializer.is_valid()
    assert 'email' in serializer.errors
    assert 'user with this email already exists.' in str(serializer.errors['email'][0])

@pytest.mark.django_db
def test_user_serializer_missing_email():
    data = {
        'name': 'Test User',
        'password': 'strong_password'
    }
    serializer = UserSerializer(data=data)
    assert not serializer.is_valid()
    assert 'email' in serializer.errors
    assert 'This field is required.' in serializer.errors['email'][0]

@pytest.mark.django_db
def test_user_serializer_missing_name():
    data = {
        'email': 'test@example.com',
        'password': 'strong_password'
    }
    serializer = UserSerializer(data=data)
    assert not serializer.is_valid()
    assert 'name' in serializer.errors
    assert 'This field is required.' in serializer.errors['name'][0]

@pytest.mark.django_db
def test_user_serializer_missing_password():
    data = {
        'email': 'test@example.com',
        'name': 'Test User'
    }
    serializer = UserSerializer(data=data)
    assert not serializer.is_valid()
    assert 'password' in serializer.errors
    assert 'This field is required.' in serializer.errors['password'][0]
