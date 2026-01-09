from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models.project import Project
from ..models.user import User
from ..serializers.reward import RewardSerializer

class RewardsView(APIView):
    """
    Handle reward management: create (POST)
    """

    def get_permissions(self):
        """
        POST (create) requires logged-in user to be project creator
        """
        return [IsAuthenticated()]

    def post(self, request, project_id):
        project = request.user.projects.filter(id=project_id).first()
        existing_project = Project.objects.filter(id=project_id).first()

        if not existing_project:
            return Response(
                ['Cannot create rewards for projects that do not exist'],
                status=status.HTTP_404_NOT_FOUND
            )
        elif not project:
            return Response(
                ['Cannot create rewards for projects that were not created by you'],
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = RewardSerializer(data=request.data, context={'project_id': project.id})
    
        if serializer.is_valid():
            serializer.save() # create() method will handle user_id
            return Response({ 'reward': serializer.data })
        
        return Response(
            serializer.errors,
            status=status.HTTP_404_NOT_FOUND
        )