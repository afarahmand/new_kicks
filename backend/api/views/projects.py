from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models.project import Project
from ..models.user import User
from ..serializers.project import ProjectSerializer
from ..serializers.user import UserSerializer

class ProjectsView(APIView):
    """
    Handle project management: create (POST), index (GET)
    """

    def get_permissions(self):
        """
        POST (create) allows any logged-in user
        GET (index) allows any user
        """
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]
    
    def get(self, request):
        projects = Project.objects.all()
        users = User.objects.all()

        projects_data = ProjectSerializer.serialize_projects_with_funded_percentage(
            projects,
            Project.projects_percentage_funded()
        )

        users_data = {
            str(user.id): UserSerializer(user).data
            for user in users
        }

        return Response({
            'projects': projects_data,
            'users': users_data
        })

    def post(self, request):
        serializer = ProjectSerializer(
            data=request.data['project'],
            context={'user_id': request.user.id}
        )
    
        if serializer.is_valid():
            serializer.save() # create() method will handle user_id
            return Response({
                'project': serializer.data,
                'user': UserSerializer(request.user).data
            })
        
        return Response(
            [str(serializer.errors)],
            status=status.HTTP_401_UNAUTHORIZED
        )