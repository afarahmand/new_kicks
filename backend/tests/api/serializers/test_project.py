import pytest
from rest_framework.exceptions import ValidationError
from django.utils import timezone
from datetime import timedelta

from api.serializers.project import ProjectSerializer
from api.models.project import Project
from api.models.user import User

# Fixtures (reusing from test_backing.py, but defined here for self-containment)
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
def project_data_factory(project_owner_fixture):
    def _project_data(**kwargs):
        data = {
            'title': 'Valid Project Title Example',
            'short_blurb': 'This is a short blurb, at least 20 characters.',
            'description': 'This is a very long description for a test project, which is at least 200 characters long. It satisfies all the validation requirements for the Project model. This verbose description ensures that creating a project instance via the serializer will pass validation. We are making sure that every detail is covered within the description to meet the minimum length requirements.',
            'funding_amount': 5000,
            'funding_end_date': timezone.now() + timedelta(days=30),
            'image_url': 'http://example.com/project_image.jpg',
            'category': 'Technology',
            'user_id': project_owner_fixture.id, # This wouldn't be in actual POST data normally, but for serializer direct testing
        }
        data.update(kwargs)
        return data
    return _project_data

@pytest.fixture
def project_fixture(project_owner_fixture):
    return Project.objects.create(
        title='Existing Project Title',
        short_blurb='This is an existing short blurb for a project.',
        description='This is an existing very very very long description for a test project that definitely meets the minimum length requirements of 200 characters. This ensures our existing project fixture is valid for testing purposes and will not cause any validation errors during test setup. This extended description should be more than enough to satisfy the validation rule.',
        funding_amount=10000,
        funding_end_date=timezone.now() + timedelta(days=60),
        image_url='http://example.com/existing_project_image.jpg',
        category='Art',
        user=project_owner_fixture
    )


@pytest.mark.django_db
def test_project_serializer_valid_serialization(project_fixture):
    # Mock the context for percentage_funded
    serializer_context = {'percentage_funded': 75.5}
    serializer = ProjectSerializer(project_fixture, context=serializer_context)
    expected_data = {
        'id': project_fixture.id,
        'title': project_fixture.title,
        'short_blurb': project_fixture.short_blurb,
        'description': project_fixture.description,
        'funding_amount': project_fixture.funding_amount,
        'funding_end_date': project_fixture.funding_end_date.isoformat().replace('+00:00', 'Z'),
        'image_url': project_fixture.image_url,
        'category': project_fixture.category,
        'user_id': project_fixture.user.id,
        'percentage_funded': 75.5
    }
    assert serializer.data == expected_data

@pytest.mark.django_db
def test_project_serializer_valid_deserialization_create(project_data_factory, project_owner_fixture):
    data = project_data_factory()
    serializer = ProjectSerializer(data=data, context={'user_id': project_owner_fixture.id})
    serializer.is_valid(raise_exception=True)
    project = serializer.save()

    assert project.title == data['title']
    assert project.description == data['description']
    assert project.user == project_owner_fixture
    assert Project.objects.count() == 1

@pytest.mark.django_db
def test_project_serializer_invalid_description_too_short(project_data_factory, project_owner_fixture):
    data = project_data_factory(description='Too short')
    serializer = ProjectSerializer(data=data, context={'user_id': project_owner_fixture.id})

    assert not serializer.is_valid()
    assert 'description' in serializer.errors
    assert 'Ensure this value has at least 200 characters (it has 9).' in str(serializer.errors['description'][0])

@pytest.mark.django_db
def test_project_serializer_invalid_funding_amount_less_than_one(project_data_factory, project_owner_fixture):
    data = project_data_factory(funding_amount=0)
    serializer = ProjectSerializer(data=data, context={'user_id': project_owner_fixture.id})
    
    assert not serializer.is_valid()
    assert 'funding_amount' in serializer.errors
    assert 'Ensure this value is greater than or equal to 1.' in str(serializer.errors['funding_amount'][0])

@pytest.mark.django_db
def test_project_serializer_invalid_funding_end_date_in_past(project_data_factory, project_owner_fixture):
    data = project_data_factory(funding_end_date=timezone.now() - timedelta(days=1))
    serializer = ProjectSerializer(data=data, context={'user_id': project_owner_fixture.id})

    assert not serializer.is_valid()
    assert 'funding_end_date' in serializer.errors
    assert 'The funding end date must be in the future' in str(serializer.errors['funding_end_date'][0])

@pytest.mark.django_db
def test_project_serializer_invalid_funding_end_date_too_far_future(project_data_factory, project_owner_fixture):
    data = project_data_factory(funding_end_date=timezone.now() + timedelta(days=366))
    serializer = ProjectSerializer(data=data, context={'user_id': project_owner_fixture.id})

    assert not serializer.is_valid()
    assert 'funding_end_date' in serializer.errors
    assert 'The funding end date must be less than one year away' in str(serializer.errors['funding_end_date'][0])

@pytest.mark.django_db
def test_project_serializer_invalid_short_blurb_too_short(project_data_factory, project_owner_fixture):
    data = project_data_factory(short_blurb='Too short') # less than 20 chars
    serializer = ProjectSerializer(data=data, context={'user_id': project_owner_fixture.id})

    assert not serializer.is_valid()
    assert 'short_blurb' in serializer.errors
    assert 'Ensure this value has at least 20 characters (it has 9).' in str(serializer.errors['short_blurb'][0])

@pytest.mark.django_db
def test_project_serializer_invalid_short_blurb_too_long(project_data_factory, project_owner_fixture):
    data = project_data_factory(short_blurb='a' * 136) # more than 135 chars
    serializer = ProjectSerializer(data=data, context={'user_id': project_owner_fixture.id})

    assert not serializer.is_valid()
    assert 'short_blurb' in serializer.errors
    assert 'Ensure this value has at most 135 characters (it has 136).' in str(serializer.errors['short_blurb'][0])

@pytest.mark.django_db
def test_project_serializer_invalid_title_too_short(project_data_factory, project_owner_fixture):
    data = project_data_factory(title='Bad') # less than 5 chars
    serializer = ProjectSerializer(data=data, context={'user_id': project_owner_fixture.id})

    assert not serializer.is_valid()
    assert 'title' in serializer.errors
    assert 'Ensure this field has at least 5 characters.' in str(serializer.errors['title'][0])

@pytest.mark.django_db
def test_project_serializer_invalid_title_too_long(project_data_factory, project_owner_fixture):
    data = project_data_factory(title='a' * 61) # more than 60 chars
    serializer = ProjectSerializer(data=data, context={'user_id': project_owner_fixture.id})

    assert not serializer.is_valid()
    assert 'title' in serializer.errors
    assert 'Ensure this value has at most 60 characters (it has 61).' in str(serializer.errors['title'][0])