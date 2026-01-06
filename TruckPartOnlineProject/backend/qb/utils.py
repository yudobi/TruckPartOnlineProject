import requests
from django.utils import timezone
from datetime import timedelta
from django.conf import settings
from .models import QuickBooksToken

#######################Función para obtener token válido##########################
def get_valid_access_token():
    token = QuickBooksToken.objects.first()
    if not token:
        raise Exception("QuickBooks no conectado")

    if token.expires_at > timezone.now():
        return token.access_token

    # Refresh token
    token_url = "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer"
    auth = (settings.QB_CLIENT_ID, settings.QB_CLIENT_SECRET)

    data = {
        "grant_type": "refresh_token",
        "refresh_token": token.refresh_token,
    }

    headers = {
        "Accept": "application/json",
        "Content-Type": "application/x-www-form-urlencoded"
    }

    response = requests.post(token_url, data=data, headers=headers, auth=auth)
    response.raise_for_status()
    data = response.json()

    token.access_token = data["access_token"]
    token.refresh_token = data["refresh_token"]
    token.expires_at = timezone.now() + timedelta(seconds=data["expires_in"])
    token.save()

    return token.access_token
########################################################################################################