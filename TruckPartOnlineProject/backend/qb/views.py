import uuid
from datetime import timedelta

import requests

from django.conf import settings
from django.http import HttpResponse
from django.shortcuts import redirect
from django.utils import timezone

from .models import QuickBooksToken

#from django.http import JsonResponse
import requests
from django.conf import settings
#from .services import get_valid_access_token
from .models import  QuickBooksToken  #,QBItem

def qb_login(request):
    state = uuid.uuid4().hex
    request.session["qb_oauth_state"] = state

    auth_url = (
        "https://appcenter.intuit.com/connect/oauth2"
        f"?client_id={settings.QB_CLIENT_ID}"
        f"&response_type=code"
        f"&scope=com.intuit.quickbooks.accounting"
        f"&redirect_uri={settings.QB_REDIRECT_URI}"
        f"&state={state}"
    )   

    return redirect(auth_url)


def qb_callback(request):
    code = request.GET.get("code")
    realm_id = request.GET.get("realmId")

    if not code or not realm_id:
        return HttpResponse("Missing code or realmId", status=400)

    token_url = "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer"

    auth = (settings.QB_CLIENT_ID, settings.QB_CLIENT_SECRET)

    data = {
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": settings.QB_REDIRECT_URI
    }

    headers = {
        "Accept": "application/json",
        "Content-Type": "application/x-www-form-urlencoded"
    }

    response = requests.post(
        token_url,
        data=data,
        headers=headers,
        auth=auth
    )

    response.raise_for_status()
    token_data = response.json()

    QuickBooksToken.objects.all().delete()

    QuickBooksToken.objects.create(
        access_token=token_data["access_token"],
        refresh_token=token_data["refresh_token"],
        realm_id=realm_id,
        expires_at=timezone.now() + timedelta(seconds=token_data["expires_in"])
    )

    return HttpResponse("QuickBooks connected successfully")


"""
#########Endpoint para traer Items de QuickBooks########################
def sync_qb_items(request):
    token = QuickBooksToken.objects.first()
    if not token:
        return JsonResponse({"error": "QuickBooks no conectado"}, status=400)

    access_token = get_valid_access_token()
    realm_id = token.realm_id

    url = f"https://sandbox-quickbooks.api.intuit.com/v3/company/{realm_id}/query"

    query = "SELECT * FROM Item"

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/json",
        "Content-Type": "application/text"
    }

    response = requests.post(
        url,
        headers=headers,
        params={"minorversion": 75},
        data=query
    )

    response.raise_for_status()

    items = response.json().get("QueryResponse", {}).get("Item", [])

    for item in items:
        QBItem.objects.update_or_create(
            qb_id=item["Id"],
            defaults={
                "name": item.get("Name"),
                "sku": item.get("Sku"),
                "qty_on_hand": item.get("QtyOnHand", 0),
                "price": item.get("UnitPrice", 0),
                "active": item.get("Active", True),
                "raw_data": item
            }
        )

    return JsonResponse({
        "imported": len(items),
        "message": "Items sincronizados correctamente"
    })
################################################################################################
"""