from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from ..serializers.users import UserSerializer

class UsersView(APIView):
    """
    Handle user management: create (POST)
    """

    def get_permissions(self):
        """
        POST (create) allows any user
        """
        return [AllowAny()]
    
    def create(self, request):
        serializer = UserSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                serializer.errors,
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
            error_data = {
                'error': 'Failed to create user',
                'details': str(e)
            }
            return Response(
                error_data,
                status=status.HTTP_401_UNAUTHORIZED
            )
    
    # def show(self, request):
    #     # future route - path('users/<int:pk>/', TaskDetail.as_view(), name='task-detail'),
    #     # future serializer - add user created and backed projects serializer
    #     return None