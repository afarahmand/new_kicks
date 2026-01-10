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
def client():
    return APIClient()

@pytest.fixture
def user_fixture():
    return User.objects.create_user(
        name='Test User',
        email='searchtest@example.com',
        password='password123'
    )

@pytest.fixture
def create_projects(user_fixture):
    Project.objects.create(
        title='The Great Search',
        short_blurb='A project about searching for treasure.',
        description="""This is a very very very long description for 'The Great Search' project, designed to easily exceed the minimum requirement of 200 characters. It is crucial that this description is sufficiently verbose to prevent any validation errors related to its length during the testing process. This extended text ensures full compliance with the Project model's validation rules for the description field. This verbose description ensures that creating a project instance via the serializer will pass validation. We are making sure that every detail is covered within the description to meet the minimum length requirements.""",
        funding_amount=1000,
        funding_end_date=timezone.now() + timedelta(days=5),
        image_url='http://example.com/search1.jpg',
        category='Art',
        user=user_fixture
    )
    Project.objects.create(
        title='Another Project Title',
        short_blurb='Seeking new discoveries in science fiction.',
        description="""This is a very very very long description for 'Another Project Title' project, designed to easily exceed the minimum requirement of 200 characters. It is crucial that this description is sufficiently verbose to prevent any validation errors related to its length during the testing process. This extended text ensures full compliance with the Project model's validation rules for the description field. This verbose description ensures that creating a project instance via the serializer will pass validation. We are making sure that every detail is covered within the description to meet the minimum length requirements.""",
        funding_amount=500,
        funding_end_date=timezone.now() + timedelta(days=10),
        image_url='http://example.com/search2.jpg',
        category='Technology',
        user=user_fixture
    )
    Project.objects.create(
        title='Hidden Gems',
        short_blurb='Unearthing rare artifacts quietly.',
        description="""This is a very very very long description for 'Hidden Gems' project, designed to easily exceed the minimum requirement of 200 characters. It is crucial that this description is sufficiently verbose to prevent any validation errors related to its length during the testing process. This extended text ensures full compliance with the Project model's validation rules for the description field. This verbose description ensures that creating a project instance via the serializer will pass validation. We are making sure that every detail is covered within the description to meet the minimum length requirements.""",
        funding_amount=200,
        funding_end_date=timezone.now() + timedelta(days=1),
        image_url='http://example.com/search3.jpg',
        category='Art',
        user=user_fixture
    )

@pytest.mark.django_db
def test_project_searches_view_no_query(client, create_projects):
    url = reverse('search')
    response = client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 3 # All 3 created projects

@pytest.mark.django_db
def test_project_searches_view_query_by_title(client, create_projects):
    url = reverse('search') + '?search[query]=Great Search'
    response = client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 1
    assert response.data[0]['title'] == 'The Great Search'

@pytest.mark.django_db
def test_project_searches_view_query_by_short_blurb(client, create_projects):
    url = reverse('search') + '?search[query]=discoveries'
    response = client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 1
    assert response.data[0]['title'] == 'Another Project Title'

@pytest.mark.django_db
def test_project_searches_view_query_no_match(client, create_projects):
    url = reverse('search') + '?search[query]=NonExistent'
    response = client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 0
