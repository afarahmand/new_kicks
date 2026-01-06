from django.shortcuts import get_object_or_404
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models.project import Project
from ..models.user import User
from ..serializers.backing import BackingSerializer
from ..serializers.project import ProjectSerializer
from ..serializers.reward import RewardSerializer

class UserView(APIView):
    """
    Handle user management: show (GET)
    """

    @staticmethod
    def _get_serialized_projects_with_funded_percentage(projects, projects_percentage_funded):
        serialized_projects_data = {}
        for project in projects:
            serializer_context = { 'percentage_funded': projects_percentage_funded[project.id] }
            serialized_projects_data[str(project.id)] = ProjectSerializer(
                project,
                context=serializer_context
            ).data

        return serialized_projects_data

    def get_permissions(self):
        """
        GET (show) allows any user
        """
        return [AllowAny()]
    
    def get(self, request, pk):
        user = get_object_or_404(User, id=pk)
        
        projects_percentage_funded = Project.projects_percentage_funded()
        backed_projects = user.backed_projects.all()
        created_projects = user.projects.all()
        backings = user.backings.all()
        rewards = user.rewards.all()

        backed_projects_data = self._get_serialized_projects_with_funded_percentage(
            backed_projects,
            projects_percentage_funded
        )
        created_projects_data = self._get_serialized_projects_with_funded_percentage(
            created_projects,
            projects_percentage_funded
        )

        rewards_data = {
            str(reward.id): RewardSerializer(reward).data 
            for reward in rewards
        }
        
        backings_data = {
            str(backing.id): BackingSerializer(backing).data 
            for backing in backings
        }
        
        return Response({
            'backed_projects': backed_projects_data,
            'created_projects': created_projects_data,
            'rewards': rewards_data,
            'backings': backings_data
        })