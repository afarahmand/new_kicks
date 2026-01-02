import pytest
from django.core.exceptions import ValidationError
from api.models.user import User
from api.models.reward import Reward
from api.models.backing import Backing

@pytest.mark.django_db
class TestUserModel:
    """Test User model functionality"""
    
    def test_create_user(self, user_data):
        """Test creating a user with valid data"""
        user = User.objects.create_user(**user_data)
        assert user.email == user_data['email']
        assert user.name == user_data['name']
        assert user.check_password(user_data['password'])
    
    def test_email_required(self):
        """Test that email is required"""
        with pytest.raises(ValueError, match='The Email field must be set'):
            User.objects.create_user(email='', password='test123', name='Test')
    
    def test_email_normalized(self):
        """Test that email is normalized"""
        user = User.objects.create_user(
            email='TEST@EXAMPLE.COM',
            password='test123',
            name='Test User'
        )
        assert user.email == 'TEST@example.com'
    
    def test_default_image_url(self, user_data):
        """Test that default image URL is set"""
        user = User.objects.create_user(**user_data)
        assert user.image_url == "https://i.imgur.com/rfxjQeS.png"
    
    def test_custom_image_url(self, user_data):
        """Test setting custom image URL"""
        user_data['image_url'] = "https://example.com/custom.jpg"
        user = User.objects.create_user(**user_data)
        assert user.image_url == user_data['image_url']
    
    def test_str_representation(self, user):
        """Test string representation of user"""
        expected = f"{user.name} - {user.email}"
        assert str(user) == expected
    
    def test_backed_projects_property(self, user, another_user, project):
        """Test backed_projects property returns correct projects"""
        # Create reward and backing
        reward = Reward.objects.create(
            project=project,
            amount=50,
            title='Test Reward',
            description='Test'
        )
        Backing.objects.create(user=another_user, reward=reward)
        
        # User who backed should see the project
        assert project in another_user.backed_projects
        # Project creator should not see it in backed projects
        assert project not in user.backed_projects
    
    def test_backed_projects_distinct(self, user, another_user, project):
        """Test backed_projects returns distinct projects"""
        # Create multiple rewards for same project
        reward1 = Reward.objects.create(
            project=project, amount=25, title='Reward 1', description='Test'
        )
        reward2 = Reward.objects.create(
            project=project, amount=50, title='Reward 2', description='Test'
        )
        
        # Back both rewards
        Backing.objects.create(user=another_user, reward=reward1)
        Backing.objects.create(user=another_user, reward=reward2)
        
        # Should return project only once
        backed = another_user.backed_projects
        assert backed.count() == 1
        assert project in backed
    
    def test_rewards_property(self, user, another_user, project):
        """Test rewards property returns user's backed rewards"""
        reward1 = Reward.objects.create(
            project=project, amount=25, title='Reward 1', description='Test'
        )
        reward2 = Reward.objects.create(
            project=project, amount=50, title='Reward 2', description='Test'
        )
        
        Backing.objects.create(user=another_user, reward=reward1)
        Backing.objects.create(user=another_user, reward=reward2)
        
        rewards = another_user.rewards
        assert rewards.count() == 2
        assert reward1 in rewards
        assert reward2 in rewards

@pytest.mark.django_db
class TestUserValidation:
    """Test user validation rules"""

    def test_email_unique(self, user):
        """Test that email must be unique"""
        with pytest.raises(ValidationError):
            User.objects.create_user(
                email=user.email,
                password='test123',
                name='Another User1'
            )