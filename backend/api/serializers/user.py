from rest_framework import serializers
from ..models.user import User

class UserSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)
    password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['id', 'email', 'name', 'password', 'image_url']

    def create(self, validated_data):
        email = validated_data['email']
        password = validated_data['password']
        name = validated_data['name']
        user = User.objects.create_user(email=email, password=password, name=name)
        return user