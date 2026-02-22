from django.shortcuts import render

# Create your views here.
#vista de autenticacion
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import RegisterSerializer, UserSerializer

User = get_user_model()

#vista de registro
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        refresh = RefreshToken.for_user(user)

        return Response({
            "user": UserSerializer(user).data,
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        })

class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)

########################################################################################################




from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth.decorators import user_passes_test
from django.contrib.auth import get_user_model
from users.models import User 

# ============================================
# VISTA PARA EL ADMIN (autocompletado)
# ============================================
def staff_required(user):
    return user.is_staff and user.is_active

@user_passes_test(staff_required)
def get_user_data(request, user_id):
    """
    Vista para obtener datos de usuario desde el admin
    """
    try:
        user = User.objects.get(id=user_id)
        return JsonResponse({
            'email': user.email,
            'full_name': user.full_name,
            'phone_number': user.phone_number,
            'address': user.address,
            'username': user.username,
            'is_guest': user.is_guest
        })
    except User.DoesNotExist:
        return JsonResponse({'error': 'Usuario no encontrado'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)