from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models.project import Project
from ..serializers.backing import BackingSerializer
from ..serializers.project import ProjectSerializer
from ..serializers.reward import RewardSerializer
from ..serializers.user import UserSerializer

class ProjectView(APIView):
    """
    Handle project management: destroy (DELETE), show (GET), update (PATCH)
    """

    @staticmethod
    def _get_complex_json_response(project):
        backings_data = {
            str(backing.id): BackingSerializer(backing).data
            for backing in project.backings
        }

        rewards_data = {
            str(reward.id): RewardSerializer(reward).data
            for reward in project.rewards.all()
        }

        project_data = ProjectSerializer(
            project,
            context={ 'percentage_funded': project.percentage_funded() }
        ).data

        user_data = UserSerializer(project.creator).data

        return Response({
            'backings': backings_data,
            'project': project_data,
            'rewards': rewards_data,
            'user': user_data,
        })

    def get_permissions(self):
        """
        DELETE and PATCH requires that user is project creator
        POST (create) handle in ProjectsView
        """
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]
    
    def delete(self, request, project_id):
        project = request.user.projects.filter(id=project_id).first()

        if not project:
            return Response(
                ["Deletion failed. Project not found"],
                status=status.HTTP_404_NOT_FOUND
            )
        
        project_data = ProjectSerializer(project).data
        project.delete()
        return Response({ 'project': project_data })

    def get(self, request, project_id):
        project = get_object_or_404(Project, id=project_id)
        return self._get_complex_json_response(project)

    def patch(self, request, project_id):
        project = request.user.projects.filter(id=project_id).first()

        if not project:
            return Response(
                ["Update failed. Project not found"],
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = ProjectSerializer(project, data=request.data, partial=True)
    
        if serializer.is_valid():
            serializer.save()
            return self._get_complex_json_response(project)
        
        return Response(
            [str(serializer.errors)],
            status=status.HTTP_401_UNAUTHORIZED
        )