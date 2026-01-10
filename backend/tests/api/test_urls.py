import pytest
from django.urls import resolve, reverse

from api.views.backings import BackingsView
from api.views.health_check import HealthCheckView
from api.views.project_discovery import ProjectDiscoveryView
from api.views.project_searches import ProjectSearchesView
from api.views.project import ProjectView
from api.views.projects import ProjectsView
from api.views.reward import RewardView
from api.views.rewards import RewardsView
from api.views.session import SessionView
from api.views.user import UserView
from api.views.users import UsersView

@pytest.mark.parametrize(
    "url_name,expected_view,kwargs,expected_path",
    [
        ('health_check', HealthCheckView, {}, '/api/health'),
        ('discovery', ProjectDiscoveryView, {}, '/api/project_discovery'),
        ('search', ProjectSearchesView, {}, '/api/project_searches'),
        ('projects', ProjectsView, {}, '/api/projects'),
        ('project', ProjectView, {'project_id': 1}, '/api/projects/1'),
        ('rewards', RewardsView, {'project_id': 1}, '/api/projects/1/rewards'),
        ('reward', RewardView, {'project_id': 1, 'reward_id': 1}, '/api/projects/1/rewards/1'),
        ('backing', BackingsView, {'project_id': 1, 'reward_id': 1}, '/api/projects/1/rewards/1/backings'),
        ('session', SessionView, {}, '/api/session'),
        ('users', UsersView, {}, '/api/users'),
        ('user', UserView, {'user_id': 1}, '/api/users/1'),
    ]
)
def test_api_urls_resolve_and_reverse(url_name, expected_view, kwargs, expected_path):
    # Test reverse: ensures URL name creates the correct path
    path = reverse(url_name, kwargs=kwargs)
    assert path == expected_path

    # Test resolve: ensures path resolves to the correct view
    resolved_view = resolve(path).func.view_class
    assert resolved_view == expected_view
