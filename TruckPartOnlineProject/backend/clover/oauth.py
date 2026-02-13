import requests
from django.conf import settings

def get_clover_tokens(code):
    """
    Intercambia un code temporal de Clover por access_token

    Para produccion ------- url = "https://api.clover.com/oauth/token"

    """
    url = "https://sandbox.dev.clover.com/oauth/token"

    data = {
        "client_id": settings.CLOVER_APP_ID,
        "client_secret": settings.CLOVER_APP_SECRET,
        "code": code,
        "grant_type": "authorization_code",
        "redirect_uri": settings.CLOVER_REDIRECT_URI
    }

    print("🔵 URL:", url)
    print("🔵 DATA ENVIADA:", data)

    response = requests.post(url, data=data)

    print("🔴 STATUS:", response.status_code)
    print("🔴 RESPONSE:", response.text)

    response.raise_for_status()

    return response.json()

def refresh_clover_token(refresh_token):
    """
    Renueva automáticamente el access_token usando refresh_token

    Para produccion ------- url = "https://api.clover.com/oauth/token"

    """
    url = "https://sandbox.dev.clover.com/oauth/token"
    data = {
        "client_id": settings.CLOVER_APP_ID,
        "client_secret": settings.CLOVER_APP_SECRET,
        "refresh_token": refresh_token,
        "grant_type": "refresh_token"
    }
    response = requests.post(url, data=data)
    response.raise_for_status()
    return response.json()  # nuevo access_token y refresh_token
