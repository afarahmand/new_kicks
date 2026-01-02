import pytest
from django.core.exceptions import ValidationError
from api.models.reward import Reward

@pytest.mark.django_db
class TestRewardModel:
    """Test Reward model functionality"""
    
    def test_create_reward(self, reward_data):
        """Test creating a reward with valid data"""
        reward = Reward.objects.create(**reward_data)
        assert reward.id is not None
        assert reward.amount == reward_data['amount']
        assert reward.title == reward_data['title']
    
    def test_amount_must_be_positive(self, reward_data):
        """Test reward amount must be at least 1"""
        reward_data['amount'] = 0
        reward = Reward(**reward_data)
        
        with pytest.raises(ValidationError) as exc_info:
            reward.save()
        
        assert 'amount' in exc_info.value.error_dict
    
    def test_amount_cannot_be_negative(self, reward_data):
        """Test reward amount cannot be negative"""
        reward_data['amount'] = -50
        reward = Reward(**reward_data)
        
        with pytest.raises(ValidationError) as exc_info:
            reward.save()
        
        assert 'amount' in exc_info.value.error_dict
    
    def test_str_representation(self, reward):
        """Test string representation of reward"""
        expected = f"{reward.amount} {reward.title}"
        assert str(reward) == expected
    
    def test_reward_deleted_with_project(self, project):
        """Test rewards are deleted when project is deleted (CASCADE)"""
        reward = Reward.objects.create(
            project=project,
            amount=50,
            title='Test',
            description='Test'
        )
        reward_id = reward.id
        
        project.delete()
        
        assert not Reward.objects.filter(id=reward_id).exists()