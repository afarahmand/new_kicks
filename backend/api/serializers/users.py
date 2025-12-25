from rest_framework import serializers
from ..models.user import User

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['email', 'name', 'password']

    def create(self, validated_data):
        user = User.objects.create(
            email=validated_data['email'],
            name=validated_data['name']
        )
        
        # Django automatically hashes the password
        user.set_password(validated_data['password'])
        user.save()
        
        return user