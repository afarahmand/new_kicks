from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models.reward import Reward
from ..serializers.reward import RewardSerializer

class RewardView(APIView):
    """
    Handle reward management: destroy (DELETE) and update (PATCH)
    """

    def get_permissions(self):
        """
        DELETE and PATCH requires that user is authenticated and project creator
        """
        return [IsAuthenticated()]

    def delete(self, request, project_id, reward_id):
        reward = Reward.objects.filter(id=reward_id).first()

        if not reward:
            return Response(
                ["Deletion failed. Reward not found"],
                status=status.HTTP_404_NOT_FOUND
            )
        
        if not request.user.projects.filter(id=reward.project_id).exists():
            return Response(
                ["Cannot delete rewards for projects that were not created by you"],
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        try:
            reward.delete()
            return Response({ 'reward': RewardSerializer(reward).data })
        except Exception as e:
            return Response(
                [str(e)],
                status=status.HTTP_404_NOT_FOUND
            )

    def patch(self, request, project_id, reward_id):
        reward = Reward.objects.filter(id=reward_id).first()

        if not reward:
            return Response(
                ["Update failed. Reward not found"],
                status=status.HTTP_404_NOT_FOUND
            )
        
        if not request.user.projects.filter(id=reward.project_id).exists():
            return Response(
                ["Cannot delete rewards for projects that were not created by you"],
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        serializer = RewardSerializer(reward, data=request.data, partial=True)
    
        if serializer.is_valid():
            serializer.save()
            return Response({ 'reward': serializer.data })
        
        return Response(
            serializer.errors,
            status=status.HTTP_404_NOT_FOUND
        )