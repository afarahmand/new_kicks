from rest_framework import serializers
from ..models.reward import Reward

class RewardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reward
        fields = ['id', 'amount', 'description', 'title', 'project_id']
        read_only_fields = ['project_id']

    def create(self, validated_data):
        validated_data['project_id'] = self.context['project_id']
        return super().create(validated_data)