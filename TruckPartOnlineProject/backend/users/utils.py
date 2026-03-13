from django.core.mail import send_mail
from django.conf import settings
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from .tokens import email_verification_token
import threading


def _send_email_async(subject, message, from_email, recipient_list):
    """
    Función interna para enviar email en un thread separado
    """
    try:
        send_mail(
            subject,
            message,
            from_email,
            recipient_list,
            fail_silently=False,
        )
    except Exception as e:
        # Log del error pero no bloquea el flujo
        print(f"Error enviando email: {e}")


def send_verification_email(user):
    """
    Envía email de verificación de forma asíncrona usando threading
    """
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = email_verification_token.make_token(user)

    verification_url = f"https://tonytruckpart.com/verify-email/{uid}/{token}"

    # Enviar email en un thread separado para no bloquear la respuesta
    email_thread = threading.Thread(
        target=_send_email_async,
        args=(
            "Verifica tu cuenta",
            f"Da click en el siguiente enlace para verificar tu cuenta:\n{verification_url}",
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
        )
    )
    email_thread.daemon = True
    email_thread.start()