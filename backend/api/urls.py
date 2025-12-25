from django.urls import path
from .views.health_check import HealthCheckView
from .views.sessions import SessionView
from .views.users import UsersView

urlpatterns = [
    path('health', HealthCheckView.as_view(), name='health_check'),
    path('session', SessionView.as_view(), name='session'),
    path('users', UsersView.as_view(), name='users')
]