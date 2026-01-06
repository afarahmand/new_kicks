from django.urls import path
from .views.health_check import HealthCheckView
from .views.session import SessionView
from .views.user import UserView
from .views.users import UsersView

urlpatterns = [
    path('health', HealthCheckView.as_view(), name='health_check'),
    path('session', SessionView.as_view(), name='session'),
    path('users', UsersView.as_view(), name='users'),
    path('users/<int:pk>', UserView.as_view(), name='user'),
]