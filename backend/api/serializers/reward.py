from rest_framework import serializers
from ..models.reward import Reward

class RewardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reward
        fields = ['id', 'amount', 'description', 'title', 'project_id']