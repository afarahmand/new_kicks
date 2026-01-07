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
    
    def serialize_projects_with_funded_percentage(projects, projects_percentage_funded):
        """
        Serialize projects with their funding percentage.
        
        Args:
            projects: QuerySet or iterable of Project instances
            projects_percentage_funded: Dict mapping project IDs to funding percentages
            
        Returns:
            Dict mapping project ID strings to serialized project data
        """
        serialized_projects_data = {}
        for project in projects:
            serializer_context = {'percentage_funded': projects_percentage_funded[project.id]}
            serialized_projects_data[str(project.id)] = ProjectSerializer(
                project,
                context=serializer_context
            ).data

        return serialized_projects_data