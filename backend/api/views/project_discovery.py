from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models.project import Project
from ..serializers.project import ProjectSerializer

class ProjectDiscoveryView(APIView):
    """
    Handle project management: destroy (DELETE), show (GET), update (PATCH)
    """

    def get_permissions(self):
        """
        GET (index) allows any user
        """
        return [AllowAny()]
    
    def get(self, request):
        category = request.GET.get('discovery[category]', 'All')
        sort = request.GET.get('discovery[sort]', 'Random')
        # num_projects = request.GET.get('discovery[numProjects]', 9)

        projects = Project.discovery_results(
            category=category,
            sort=sort
        )

        project_data = ProjectSerializer(projects, many=True).data

        return Response(project_data)