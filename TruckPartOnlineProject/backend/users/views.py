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

from django.contrib.auth.hashers import make_password
from .models import PasswordResetRequest
from .utils import send_password_reset_email
from django.utils import timezone
from datetime import timedelta

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
            "user": UserSerializer(user).data,
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
# REENVIAR EMAIL DE VERIFICACIÓN
# ============================================

@api_view(["POST"])
def resend_verification(request):
    """
    Reenvía el email de verificación a un usuario no verificado
    """
    email = request.data.get('email')
    
    if not email:
        return Response({"error": "Email requerido"}, status=400)
    
    try:
        user = User.objects.get(email=email)
        
        if user.is_active:
            return Response({"error": "Usuario ya verificado"}, status=400)
        
        send_verification_email(user)
        
        return Response({
            "message": "Email de verificación enviado"
        })
        
    except User.DoesNotExist:
        # Por seguridad, no revelar si el email existe o no
        return Response({
            "message": "Si el email existe, recibirás un correo de verificación"
        })


# ============================================
# VERIFICAR ESTADO DE CUENTA
# ============================================

@api_view(["POST"])
def check_account_status(request):
    """
    Verifica si una cuenta existe y su estado de verificación
    """
    email = request.data.get('email')
    
    if not email:
        return Response({"error": "Email requerido"}, status=400)
    
    try:
        user = User.objects.get(email=email)
        
        return Response({
            "exists": True,
            "is_active": user.is_active,
            "email": user.email
        })
        
    except User.DoesNotExist:
        return Response({
            "exists": False,
            "is_active": False
        })


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








from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainPairSerializer

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer








import logging
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

logger = logging.getLogger(__name__)

@api_view(['POST'])
def debug_login(request):
    """
    Vista temporal para debug - muestra exactamente qué llega
    """
    print("\n" + "="*50)
    print("🔍 DEBUG LOGIN - DATOS RECIBIDOS:")
    print("="*50)
    print(f"Headers: {dict(request.headers)}")
    print(f"Content-Type: {request.content_type}")
    print(f"Data: {request.data}")
    print(f"Body: {request.body.decode('utf-8')}")
    print("="*50 + "\n")
    
    # Intentar autenticar con cualquier campo que llegue
    from django.contrib.auth import authenticate
    
    email = request.data.get('email')
    username = request.data.get('username')
    password = request.data.get('password')
    
    print(f"Email extraído: {email}")
    print(f"Username extraído: {username}")
    
    # Probar autenticación
    user = None
    if email:
        user = authenticate(username=email, password=password)
        print(f"Auth con email: {user}")
    
    if not user and username:
        user = authenticate(username=username, password=password)
        print(f"Auth con username: {user}")
    
    return Response({
        "received": request.data,
        "email_found": email,
        "username_found": username,
        "auth_result": "success" if user else "failed"
    }, status=status.HTTP_200_OK)








########################################### RESETEO DE CONTRASEÑA ####################################################

from django.utils import timezone
from datetime import timedelta

@api_view(["POST"])
def password_reset_request(request):

    email = request.data.get("email")

    if not email:
        return Response({"error": "Email requerido"}, status=400)

    try:

        user = User.objects.get(email=email)

        reset_request = PasswordResetRequest.objects.create(
            user=user
        )

        send_password_reset_email(user, reset_request)

    except User.DoesNotExist:
        pass

    return Response({
        "message": "Si el email existe recibirás instrucciones"
    })


@api_view(["POST"])
def password_reset_confirm(request):

    uidb64 = request.data.get("uid")
    token = request.data.get("token")
    request_id = request.data.get("request_id")
    new_password = request.data.get("new_password")

    try:

        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)

        reset_request = PasswordResetRequest.objects.get(
            id=request_id,
            user=user,
            is_used=False
        )

        if not email_verification_token.check_token(user, token):
            return Response({"error": "Token inválido"}, status=400)

        # expiración
        if reset_request.created_at < timezone.now() - timedelta(minutes=15):
            return Response({"error": "Link expirado"}, status=400)

        user.set_password(new_password)
        user.save()

        reset_request.is_used = True
        reset_request.save()

        return Response({
            "message": "Contraseña actualizada correctamente"
        })

    except Exception:
        return Response({"error": "Link inválido"}, status=400)