from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from ..serializers.user import UserSerializer

class UsersView(APIView):
    """
    Handle user management: create (POST)
    """

    def get_permissions(self):
        """
        POST (create) allows any user
        """
        return [AllowAny()]
    
    def post(self, request):
        serializer = UserSerializer(data=request.data['user'])

        if not serializer.is_valid():
            return Response(
                [str(serializer.errors)],
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Save the user (calls serializer.create() method)
            user = serializer.save()
            
            return Response({
                'id': user.id,
                'email': user.email,
                'name': user.name,
            })
            
        except Exception as e:
            return Response(
                [str(e)],
                status=status.HTTP_401_UNAUTHORIZED
            )