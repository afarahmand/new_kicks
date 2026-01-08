from django.urls import path
from .views.backings import BackingsView
from .views.health_check import HealthCheckView
from .views.project_discovery import ProjectDiscoveryView
from .views.project_searches import ProjectSearchesView
from .views.project import ProjectView
from .views.projects import ProjectsView
from .views.reward import RewardView
from .views.rewards import RewardsView
from .views.session import SessionView
from .views.user import UserView
from .views.users import UsersView

urlpatterns = [
    path('health', HealthCheckView.as_view(), name='health_check'),
    path('project_discovery', ProjectDiscoveryView.as_view(), name='discovery'),
    path('project_searches', ProjectSearchesView.as_view(), name='search'),
    path('projects', ProjectsView.as_view(), name='projects'),
    path('projects/<int:pk>', ProjectView.as_view(), name='project'),
    path('projects/<int:pk>/rewards', RewardsView.as_view(), name='rewards'),
    path('projects/<int:project_pk>/rewards/<int:reward_pk>', RewardView.as_view(), name='reward'),
    path('projects/<int:project_pk>/rewards/<int:reward_pk>/backings', BackingsView.as_view(), name='backing'),
    path('session', SessionView.as_view(), name='session'),
    path('users', UsersView.as_view(), name='users'),
    path('users/<int:pk>', UserView.as_view(), name='user'),
]