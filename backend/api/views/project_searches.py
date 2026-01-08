from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models.project import Project
from ..serializers.project import ProjectSerializer

class ProjectSearchesView(APIView):
    """
    Handle project management: destroy (DELETE), show (GET), update (PATCH)
    """

    def get_permissions(self):
        """
        GET (index) allows any user
        """
        return [AllowAny()]
    
    def get(self, request):
        query = request.GET.get('search[query]', '')
        projects = Project.search_results(query)
        project_data = ProjectSerializer(projects, many=True).data

        return Response(project_data)