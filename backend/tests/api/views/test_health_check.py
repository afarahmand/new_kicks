import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

@pytest.mark.django_db
def test_health_check_view():
    client = APIClient()
    url = reverse('health_check')
    response = client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert response.data == {'message': 'Server is healthy'}
