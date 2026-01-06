from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models.backing import Backing
from ..models.reward import Reward
from ..serializers.backing import BackingSerializer

class BackingsView(APIView):
    """
    Handle backing creation: create (POST)
    """

    def get_permissions(self):
        """
        POST (create) requires authenticated user
        """
        return [IsAuthenticated()]

    def post(self, request, project_pk, reward_pk):
        reward = Reward.objects.filter(id=reward_pk).first()
        project = reward.project

        if not reward:
            return Response(
                ["You must choose an existing reward to back a project"],
                status=status.HTTP_404_NOT_FOUND
            )
        elif request.user.projects.filter(id=project.id).exists():
            return Response(
                ["You can't back your own projects"],
                status=status.HTTP_403_FORBIDDEN
            )
        elif not project:
            return Response(
                ["You can't back a project that does not exist"],
                status=status.HTTP_404_NOT_FOUND
            )
        elif request.user.backed_projects.filter(id=project.id).exists():
            return Response(
                ["You can't back a project again once you have already backed it"],
                status=status.HTTP_403_FORBIDDEN
            )
        
        backing = Backing()
        backing.user = request.user
        backing.reward = reward

        try:
            backing.save()
            return Response(BackingSerializer(backing).data)
        except Exception as e:
            return Response(
                [str(e)],
                status=status.HTTP_404_NOT_FOUND
            )