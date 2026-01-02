import pytest
from django.core.exceptions import ValidationError
from django.db import IntegrityError
from api.models.user import User
from api.models.reward import Reward
from api.models.backing import Backing

@pytest.mark.django_db
class TestBackingModel:
    """Test Backing model functionality"""
    
    def test_create_backing(self, backing_data):
        """Test creating a backing with valid data"""
        backing = Backing.objects.create(**backing_data)
        assert backing.id is not None
        assert backing.user == backing_data['user']
        assert backing.reward == backing_data['reward']
    
    def test_backer_property(self, another_user, reward):
        """Test backer property returns user"""
        backing = Backing.objects.create(user=another_user, reward=reward)
        assert backing.backer == another_user
    
    def test_project_property(self, another_user, reward):
        """Test project property returns reward's project"""
        backing = Backing.objects.create(user=another_user, reward=reward)
        assert backing.project == reward.project
    
    def test_str_representation(self, another_user, reward):
        """Test string representation of backing"""
        backing = Backing.objects.create(user=another_user, reward=reward)
        expected = f"{backing.id} ${backing.reward.amount}"
        assert str(backing) == expected
    
    def test_unique_user_reward_constraint(self, another_user, reward):
        """Test user cannot back same reward twice"""
        Backing.objects.create(user=another_user, reward=reward)
        
        with pytest.raises(ValidationError):
            Backing.objects.create(user=another_user, reward=reward)
    
    def test_user_can_back_different_rewards(self, another_user, project):
        """Test user can back multiple rewards from same project"""
        reward1 = Reward.objects.create(
            project=project, amount=25, title='R1', description='T'
        )
        reward2 = Reward.objects.create(
            project=project, amount=50, title='R2', description='T'
        )
        
        backing1 = Backing.objects.create(user=another_user, reward=reward1)
        backing2 = Backing.objects.create(user=another_user, reward=reward2)
        
        assert backing1.id is not None
        assert backing2.id is not None
    
    def test_different_users_can_back_same_reward(self, another_user, reward):
        """Test multiple users can back the same reward"""
        user2 = User.objects.create_user(
            email='user2@example.com',
            name='User 2',
            password='pass'
        )
        
        backing1 = Backing.objects.create(user=another_user, reward=reward)
        backing2 = Backing.objects.create(user=user2, reward=reward)
        
        assert backing1.id is not None
        assert backing2.id is not None
    
    def test_backing_deleted_with_reward(self, another_user, reward):
        """Test backings are deleted when reward is deleted (CASCADE)"""
        backing = Backing.objects.create(user=another_user, reward=reward)
        backing_id = backing.id
        
        reward.delete()
        
        assert not Backing.objects.filter(id=backing_id).exists()
    
    def test_backing_deleted_with_user(self, another_user, reward):
        """Test backings are deleted when user is deleted (CASCADE)"""
        backing = Backing.objects.create(user=another_user, reward=reward)
        backing_id = backing.id
        
        another_user.delete()
        
        assert not Backing.objects.filter(id=backing_id).exists()


@pytest.mark.django_db
class TestBackingValidation:
    """Test backing validation rules"""
    
    def test_creator_cannot_back_own_project(self, user, project):
        """Test project creator cannot back their own project"""
        reward = Reward.objects.create(
            project=project,
            amount=50,
            title='Test',
            description='Test'
        )
        backing = Backing(user=user, reward=reward)
        
        with pytest.raises(ValidationError) as exc_info:
            backing.save()
        
        # Check error message mentions user/project owner
        error_msg = str(exc_info.value)
        assert 'project owner' in error_msg.lower() or 'creator' in error_msg.lower()
    
    def test_non_creator_can_back_project(self, another_user, project):
        """Test non-creator can successfully back a project"""
        reward = Reward.objects.create(
            project=project,
            amount=50,
            title='Test',
            description='Test'
        )
        backing = Backing.objects.create(user=another_user, reward=reward)
        
        assert backing.id is not None
        assert backing.user != project.user