from rest_framework import serializers
from ..models.backing import Backing
from ..models.user import User
from ..models.reward import Reward

class BackingSerializer(serializers.ModelSerializer):
    reward_id = serializers.PrimaryKeyRelatedField(
        queryset=Reward.objects.all(), source='reward'
    )
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source='user'
    )

    class Meta:
        model = Backing
        fields = ['id', 'reward_id', 'user_id']

    def create(self, validated_data):
        reward = validated_data.pop('reward')
        user = validated_data.pop('user')
        backing = Backing.objects.create(reward=reward, user=user, **validated_data)
        
        return backing