from django.shortcuts import render
from api import serializer as api_serializer
from userauths.models import User, Profile
from rest_framework.response import Response
from django.core.mail import EmailMultiAlternatives
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.views import APIView
from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from .serializer import RegisterSerializer
from rest_framework_simplejwt.tokens import RefreshToken
import random
from rest_framework.response import Response
from django.template.loader import render_to_string
from django.conf import settings

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = api_serializer.MyTokenObtainPairSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

def generate_random_otp(length=7):
    return ''.join([str(random.randint(0, 9)) for _ in range(length)])

##_________________________________________________________________________________________________________________________________________________________

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

        merge_data = {
            "link":link,
            "username":user.username
        }

        subject = "Password Rest Email"
        text_body = render_to_string("email/password_reset.txt", context)
        html_body = render_to_string("email/password_reset.html", context)

        msg = EmailMultiAlternatives(
            subject = subject,
            from_email = settings.FROM_EMAIL,
            to=[user.email],
            body = text_body,
        )
        msg.attach_alternative(html_body, "text/html")
        msg.send()
        print("link =====", link)




        # Use the serializer to serialize the user data, so all fields can be returned in the response
        serializer = self.serializer_class(user)

        # Return the serialized user data with a success message
        return Response(serializer.data, status=200)

##____________________________________________________________________________________________________________________________________________________________
class PasswordChangeAPIView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = api_serializer.UserSerializer

    def create(self, request, *args, **kwargs):
        # Ensure keys exist before accessing them
        otp = request.data.get('otp')
        uuidb64 = request.data.get('uuidb64')
        password = request.data.get('password')

        # Check if all required data is present
        if not all([otp, uuidb64, password]):
            return Response({"error": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Convert uuidb64 (which is likely an integer) to int if it's base64 encoded
            user_id = int(uuidb64)  # Assuming uuidb64 is the user id (adjust based on your encoding logic)

            # Attempt to get the user with the provided OTP and uuidb64 (user_id)
            user = get_user_model().objects.get(id=user_id, otp=otp)

            # If user exists, set the new password
            user.set_password(password)
            user.otp = ""  # Clear the OTP once password is reset
            user.save()

            return Response({"message": "Password Changed Successfully"}, status=status.HTTP_201_CREATED)

        except get_user_model().DoesNotExist:
            return Response({"message": "User Does Not Exist or OTP Invalid"}, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)