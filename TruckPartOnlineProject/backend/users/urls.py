from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from .views import RegisterView, MeView, verify_email, resend_verification, check_account_status, request_password_reset, confirm_password_reset
from . import views

# Serializer personalizado que acepta email
class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        # Si viene 'email' pero no 'username', usar email como username
        if 'email' in attrs and 'username' not in attrs:
            attrs['username'] = attrs['email']
        return super().validate(attrs)

# Vista personalizada
class EmailTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer

urlpatterns = [
    path('register/', RegisterView.as_view()),
    path('login/', EmailTokenObtainPairView.as_view()),  # 👈 AHORA ACEPTA EMAIL
    path('token/refresh/', TokenRefreshView.as_view()),
    path('me/', MeView.as_view()),
    path('admin/get-user-data/<int:user_id>/', views.get_user_data, name='get_user_data'),
    path("verify-email/<uidb64>/<token>/", verify_email),
    path("resend-verification/", resend_verification),
    path("check-account-status/", check_account_status),
    
    path("password-reset/", request_password_reset),
    path("reset-password-confirm/<uidb64>/<token>/<int:request_id>/", confirm_password_reset),


]
