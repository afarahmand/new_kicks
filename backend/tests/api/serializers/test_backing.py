import pytest
from rest_framework.exceptions import ValidationError
from django.utils import timezone

from api.serializers.backing import BackingSerializer
from api.models.backing import Backing
from api.models.user import User
from api.models.project import Project
from api.models.reward import Reward

@pytest.fixture
def user_fixture():
    return User.objects.create_user(
        name='Test User',
        email='test@example.com',
        password='password123'
    )

@pytest.fixture
def project_owner_fixture():
    return User.objects.create_user(
        name='Project Owner',
        email='owner@example.com',
        password='password123'
    )

@pytest.fixture
def project_fixture(project_owner_fixture):
    return Project.objects.create(
        title='Test Project',
        description='This is a very long description for a test project. It needs to be at least 200 characters long to satisfy the validation requirements of the Project model. This extended description should be sufficient to pass the validation checks for the Project instance creation in the test fixtures. We are adding more text to ensure it meets the minimum length. This will allow the tests to proceed without ValidationError related to the description field. Enjoy this verbose and descriptive description!',
        short_blurb='A short blurb for the test project.',
        funding_amount=1000,
        funding_end_date=timezone.now() + timezone.timedelta(days=30),
        image_url='http://example.com/image.jpg',
        category='Technology',
        user=project_owner_fixture
    )

@pytest.fixture
def reward_fixture(project_fixture):
    return Reward.objects.create(
        project=project_fixture,
        title='Test Reward',
        description='A reward for testing purposes.',
        amount=10
    )

@pytest.fixture
def backing_fixture(user_fixture, reward_fixture):
    return Backing.objects.create(
        user=user_fixture,
        reward=reward_fixture
    )


@pytest.mark.django_db
def test_backing_serializer_valid_serialization(backing_fixture):
    serializer = BackingSerializer(backing_fixture)
    expected_data = {
        'id': backing_fixture.id,
        'reward_id': backing_fixture.reward.id,
        'user_id': backing_fixture.user.id
    }
    assert serializer.data == expected_data

@pytest.mark.django_db
def test_backing_serializer_valid_deserialization_create(user_fixture, reward_fixture):
    data = {
        'reward_id': reward_fixture.id,
        'user_id': user_fixture.id
    }
    serializer = BackingSerializer(data=data)
    serializer.is_valid(raise_exception=True)
    backing = serializer.save()

    assert backing.user == user_fixture
    assert backing.reward == reward_fixture
    assert Backing.objects.count() == 1

@pytest.mark.django_db
def test_backing_serializer_invalid_deserialization_unique_user_reward(backing_fixture, user_fixture, reward_fixture):
    # Attempt to create a backing with the same user and reward as an existing backing
    data = {
        'reward_id': reward_fixture.id,
        'user_id': user_fixture.id
    }
    serializer = BackingSerializer(data=data)

    # is_valid() should fail
    assert not serializer.is_valid()

    assert 'non_field_errors' in serializer.errors
    assert 'The fields user_id, reward_id must make a unique set.' in str(serializer.errors['non_field_errors'][0])
