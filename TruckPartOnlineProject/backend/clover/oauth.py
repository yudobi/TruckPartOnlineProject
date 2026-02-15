import requests
from django.conf import settings


def get_clover_tokens(code):
    """
    Intercambia el authorization code por access_token y refresh_token.
    Funciona automáticamente para sandbox o producción según CLOVER_ENV.
    """

    url = f"{settings.CLOVER['BASE_URL']}/oauth/token"

    data = {
        "client_id": settings.CLOVER["APP_ID"],
        "client_secret": settings.CLOVER["APP_SECRET"],
        "code": code,
        "grant_type": "authorization_code",
        "redirect_uri": settings.CLOVER["REDIRECT_URI"],
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
    Renueva automáticamente el access_token usando refresh_token.
    Funciona automáticamente para sandbox o producción.
    """

    url = f"{settings.CLOVER['BASE_URL']}/oauth/token"

    data = {
        "client_id": settings.CLOVER["APP_ID"],
        "client_secret": settings.CLOVER["APP_SECRET"],
        "refresh_token": refresh_token,
        "grant_type": "refresh_token",
    }

    print("🔵 REFRESH URL:", url)
    print("🔵 REFRESH DATA:", data)

    response = requests.post(url, data=data)

    print("🔴 REFRESH STATUS:", response.status_code)
    print("🔴 REFRESH RESPONSE:", response.text)

    response.raise_for_status()

    return response.json()
