from django.urls import path
from .views.backings import BackingsView
from .views.health_check import HealthCheckView
from .views.session import SessionView
from .views.user import UserView
from .views.users import UsersView

urlpatterns = [
    path('health', HealthCheckView.as_view(), name='health_check'),
    path('projects/<int:pk>', ProjectView.as_view(), name='project'),
    path('projects/<int:project_pk>/rewards/<int:reward_pk>/backings', BackingsView.as_view(), name='backing'),
    path('session', SessionView.as_view(), name='session'),
    path('users', UsersView.as_view(), name='users'),
    path('users/<int:pk>', UserView.as_view(), name='user'),
]