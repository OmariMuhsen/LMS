from django.shortcuts import render
from api import serializer as api_serializer
from userauths.models import User, Profile
from rest_framework.response import Response

from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.views import APIView
from rest_framework import generics
from rest_framework.permissions import AllowAny
from .serializer import RegisterSerializer
from rest_framework_simplejwt.tokens import RefreshToken
import random

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = api_serializer.MyTokenObtainPairSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

def generate_random_otp(length=7):
    return ''.join([str(random.randint(0, 9)) for _ in range(length)])


class PasswordResetEmailVerifyAPIView(APIView):
    permission_classes = [AllowAny]  # Allow access without authentication (public endpoint)
    serializer_class = api_serializer.UserSerializer  # Use the UserSerializer to return serialized user data

    def get(self, request, email):
        try:
            # Try to find a user by the provided email
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Return an error response if user with the given email does not exist
            return Response({"error": "User not found."}, status=404)

        # Generate a unique identifier (UUID) for the user and a JWT refresh token
        uuidb64 = user.pk
        refresh = RefreshToken.for_user(user)
        refresh_token = str(refresh.access_token)

        # Generate a random OTP (One-Time Password) and save it to the user
        user.otp = generate_random_otp()  # Ensure that the function `generate_random_otp` is defined
        user.refresh_token = refresh_token  # Save the refresh token in the user model (if needed)
        user.save()  # Save changes to the user object

        # Generate a reset password link to send to the user (can be used on the frontend)
        link = f"http://localhost:5173/create-new-password/?otp={user.otp}&uuidb64={uuidb64}&refresh_token={refresh_token}"
        print("Reset link:", link)  # Debugging/logging the generated reset link

        # Use the serializer to serialize the user data, so all fields can be returned in the response
        serializer = self.serializer_class(user)

        # Return the serialized user data with a success message
        return Response(serializer.data, status=200)


