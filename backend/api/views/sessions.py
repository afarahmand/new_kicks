from django.contrib.auth import authenticate
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from ..serializers.sessions import SessionSerializer

class SessionView(APIView):
    """
    Handle session management: get_current_user (GET), login (POST), and logout (DELETE)
    """
    
    def get_permissions(self):
        """
        GET (get current user) and POST (login) allows any user, DELETE (logout) requires authentication
        """
        if self.request.method == 'DELETE':
            return [IsAuthenticated()]
        return [AllowAny()]
        
    def delete(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if not refresh_token:
                return Response({})

            token = RefreshToken(refresh_token)
            token.blacklist()

            return Response({})
        except Exception:
            return Response({})
    
    def get(self, request):
        try:
            current_user = request.user

            return Response({
                "id": current_user.id,
                "email": current_user.email,
                "name": current_user.name,
            })
        except Exception:
            return Response({})
    
    def post(self, request):
        serializer = SessionSerializer(data=request.data["user"])
        serializer.is_valid(raise_exception=True)  # validate email format
        validated_data = serializer.validated_data

        email = validated_data["email"]
        password = validated_data["password"]
        
        user = authenticate(username=email, password=password)
        
        if user:
            refresh = RefreshToken.for_user(user)
            return Response({
                "refresh": str(refresh),
                "token": str(refresh.access_token),
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "name": user.name,
                }
            })
        return Response(
            ['Invalid email or password'],
            status=status.HTTP_401_UNAUTHORIZED
        )