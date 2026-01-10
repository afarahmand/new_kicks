import pytest
from rest_framework.exceptions import ValidationError
from django.utils import timezone
from datetime import timedelta

from api.serializers.reward import RewardSerializer
from api.models.reward import Reward
from api.models.project import Project
from api.models.user import User

# Fixtures
@pytest.fixture
def user_fixture():
    return User.objects.create_user(
        name='Test User',
        email='rewardtest@example.com',
        password='password123'
    )

@pytest.fixture
def project_fixture(user_fixture):
    return Project.objects.create(
        title='Reward Test Project',
        short_blurb='This is a short blurb for a reward test project.',
        description='This is a very very very long description for a reward test project that definitely meets the minimum length requirements of 200 characters. This ensures our project fixture is valid for testing purposes and will not cause any validation errors during test setup.',
        funding_amount=5000,
        funding_end_date=timezone.now() + timedelta(days=30),
        image_url='http://example.com/reward_project_image.jpg',
        category='Games',
        user=user_fixture
    )

@pytest.fixture
def reward_data_factory(project_fixture):
    def _reward_data(**kwargs):
        data = {
            'title': 'Test Reward Title',
            'description': 'A descriptive reward for testing.',
            'amount': 25,
            'project_id': project_fixture.id, # This wouldn't be in actual POST data normally
        }
        data.update(kwargs)
        return data
    return _reward_data

@pytest.fixture
def reward_fixture(project_fixture):
    return Reward.objects.create(
        project=project_fixture,
        title='Existing Reward',
        description='An existing reward description.',
        amount=50
    )

@pytest.mark.django_db
def test_reward_serializer_valid_serialization(reward_fixture):
    serializer = RewardSerializer(reward_fixture)
    expected_data = {
        'id': reward_fixture.id,
        'amount': reward_fixture.amount,
        'description': reward_fixture.description,
        'title': reward_fixture.title,
        'project_id': reward_fixture.project.id
    }
    assert serializer.data == expected_data

@pytest.mark.django_db
def test_reward_serializer_valid_deserialization_create(reward_data_factory, project_fixture):
    data = reward_data_factory()
    serializer = RewardSerializer(data=data, context={'project_id': project_fixture.id})
    serializer.is_valid(raise_exception=True)
    reward = serializer.save()

    assert reward.title == data['title']
    assert reward.description == data['description']
    assert reward.amount == data['amount']
    assert reward.project == project_fixture
    assert Reward.objects.count() == 1

@pytest.mark.django_db
def test_reward_serializer_invalid_amount_less_than_one(reward_data_factory, project_fixture):
    data = reward_data_factory(amount=0)
    serializer = RewardSerializer(data=data, context={'project_id': project_fixture.id})

    assert not serializer.is_valid()
    assert 'amount' in serializer.errors
    assert 'Ensure this value is greater than or equal to 1.' in str(serializer.errors['amount'][0])

@pytest.mark.django_db
def test_reward_serializer_missing_required_fields(project_fixture):
    data = {
        'description': 'A description',
        'amount': 10,
        'project_id': project_fixture.id
    } # Missing title
    serializer = RewardSerializer(data=data, context={'project_id': project_fixture.id})

    assert not serializer.is_valid()
    assert 'title' in serializer.errors
    assert 'This field is required.' in str(serializer.errors['title'][0])
