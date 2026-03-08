"""

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

    def patch(self, request):
        allowed_fields = {'full_name', 'phone_number', 'address'}
        data = {key: value for key, value in request.data.items() if key in allowed_fields}
        serializer = UserSerializer(request.user, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

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
    
    #Vista para obtener datos de usuario desde el admin
    
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
        """

from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth.decorators import user_passes_test
from django.contrib.auth import get_user_model

from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view

from rest_framework_simplejwt.tokens import RefreshToken

from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str

from .serializers import RegisterSerializer, UserSerializer
from .tokens import email_verification_token
from .utils import send_verification_email

User = get_user_model()

# ============================================
# REGISTRO CON VERIFICACION DE EMAIL
# ============================================

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.save(is_active=False)

        send_verification_email(user)

        return Response({
            "message": "Revisa tu correo para verificar tu cuenta"
        })


# ============================================
# VERIFICAR EMAIL
# ============================================

@api_view(["GET"])
def verify_email(request, uidb64, token):

    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)

        if email_verification_token.check_token(user, token):

            user.is_active = True
            user.save()

            refresh = RefreshToken.for_user(user)

            return Response({
                "message": "Correo verificado correctamente",
                "user": UserSerializer(user).data,
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            })

        return Response({"error": "Token inválido"}, status=400)

    except Exception as e:
        return Response({"error": "Link inválido"}, status=400)


# ============================================
# OBTENER USUARIO ACTUAL
# ============================================

class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def patch(self, request):

        allowed_fields = {'full_name', 'phone_number', 'address'}

        data = {
            key: value
            for key, value in request.data.items()
            if key in allowed_fields
        }

        serializer = UserSerializer(
            request.user,
            data=data,
            partial=True
        )

        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data)


# ============================================
# VISTA PARA ADMIN (AUTOCOMPLETADO)
# ============================================

def staff_required(user):
    return user.is_staff and user.is_active


@user_passes_test(staff_required)
def get_user_data(request, user_id):

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