from django.core.mail import send_mail
from django.conf import settings
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from .tokens import email_verification_token

def send_verification_email(user):

    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = email_verification_token.make_token(user)

    verification_url = f"http://localhost:5173/verify-email/{uid}/{token}"

    send_mail(
        "Verifica tu cuenta",
        f"Da click en el siguiente enlace para verificar tu cuenta:\n{verification_url}",
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        fail_silently=False,
    )