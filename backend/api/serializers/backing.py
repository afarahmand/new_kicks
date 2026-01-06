from rest_framework import serializers
from ..models.backing import Backing

class BackingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Backing
        fields = ['id', 'reward_id', 'user_id']