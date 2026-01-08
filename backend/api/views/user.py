from django.shortcuts import get_object_or_404
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models.project import Project
from ..models.user import User
from ..serializers.backing import BackingSerializer
from ..serializers.project import ProjectSerializer
from ..serializers.reward import RewardSerializer
from ..serializers.user import UserSerializer

class UserView(APIView):
    """
    Handle user management: show (GET)
    """

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

        backed_projects_data = ProjectSerializer.serialize_projects_with_funded_percentage(
            backed_projects,
            projects_percentage_funded
        )
        created_projects_data = ProjectSerializer.serialize_projects_with_funded_percentage(
            created_projects,
            projects_percentage_funded
        )

        backings_data = {
            str(backing.id): BackingSerializer(backing).data 
            for backing in backings
        }

        rewards_data = {
            str(reward.id): RewardSerializer(reward).data 
            for reward in rewards
        }

        user_data = UserSerializer(user).data
        
        return Response({
            'backed_projects': backed_projects_data,
            'backings': backings_data,
            'created_projects': created_projects_data,
            'rewards': rewards_data,
            'user': user_data
        })