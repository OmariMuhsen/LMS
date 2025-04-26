from api import views as api_views
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView



urlpatterns = [
    path("user/token/", api_views.MyTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("user/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("user/register/", api_views.RegisterView.as_view(), name="register"),
    path("user/password-reset/<email>/", api_views.PasswordResetEmailVerifyAPIView.as_view(), name="password_reset_email"),

]