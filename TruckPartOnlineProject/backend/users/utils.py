from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from .tokens import email_verification_token
import threading


def _send_html_email_async(subject, text_content, html_content, from_email, recipient_list):
    """
    Envia email con HTML y texto plano en un thread separado
    """
    try:
        email = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=from_email,
            to=recipient_list,
        )
        email.attach_alternative(html_content, "text/html")
        email.send(fail_silently=False)
    except Exception as e:
        print(f"Error enviando email: {e}")


def send_verification_email(user):
    """
    Envia email de verificacion de forma asincrona usando threading
    """
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = email_verification_token.make_token(user)

    frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
    verification_url = f"{frontend_url}/verify-email/{uid}/{token}"

    context = {'verification_url': verification_url}

    text_content = render_to_string('emails/verification_email.txt', context)
    html_content = render_to_string('emails/verification_email.html', context)

    email_thread = threading.Thread(
        target=_send_html_email_async,
        args=(
            "Verifica tu cuenta - TruckPartOnline",
            text_content,
            html_content,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
        )
    )
    email_thread.daemon = True
    email_thread.start()


def send_password_reset_email(user, reset_request):
    """
    Envia email de restablecimiento de contraseña de forma asincrona
    """
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = email_verification_token.make_token(user)

    frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
    reset_url = f"{frontend_url}/reset-password/{uid}/{token}/{reset_request.id}"

    context = {'reset_url': reset_url}

    text_content = render_to_string('emails/password_reset_email.txt', context)
    html_content = render_to_string('emails/password_reset_email.html', context)

    email_thread = threading.Thread(
        target=_send_html_email_async,
        args=(
            "Restablecer contraseña - TruckPartOnline",
            text_content,
            html_content,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
        )
    )
    email_thread.daemon = True
    email_thread.start()
