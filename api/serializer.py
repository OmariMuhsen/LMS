from rest_framework import serializers
from userauths.models import User, Profile


class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = '__all__'

class profileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'