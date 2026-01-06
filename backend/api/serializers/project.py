from rest_framework import serializers
from ..models.project import Project

class ProjectSerializer(serializers.ModelSerializer):
    percentage_funded = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            'id',
            'title',
            'short_blurb',
            'description',
            'funding_amount',
            'funding_end_date',
            'image_url',
            'category',
            'user_id',
            'percentage_funded'
        ]

    def get_percentage_funded(self, obj):
        percentages = self.context.get('percentage_funded', {})
        return percentages