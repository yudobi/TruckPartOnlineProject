#FUNCIÓN PARA CREAR SalesReceipt EN QUICKBOOKS DESDE UN PEDIDO EN TRUCKPARTONLINEPROJECT
"""import requests
from django.conf import settings
from .models import QuickBooksToken

def create_sales_receipt(order):
    token = QuickBooksToken.objects.first()

    url = (
        f"https://sandbox-quickbooks.api.intuit.com/v3/company/"
        f"{token.realm_id}/salesreceipt"
    )

    headers = {
        "Authorization": f"Bearer {token.access_token}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }

    lines = []

    for item in order.items.all():
        lines.append({
            "DetailType": "SalesItemLineDetail",
            "Amount": float(item.price * item.quantity),
            "SalesItemLineDetail": {
                "ItemRef": {
                    "value": item.product.qb_id
                },
                "Qty": item.quantity,
                "UnitPrice": float(item.price)
            }
        })

    payload = {
        "Line": lines,
        "CustomerRef": {
            "value": "1"  # cliente genérico sandbox
        }
    }

    response = requests.post(url, json=payload, headers=headers)
    response.raise_for_status()

    return response.json()

#############FUNCIÓN PARA CONSULTAR STOCK EN QUICKBOOKS###################################################################################

from qb.models import QBToken


def get_qb_access_token():
    token = QBToken.objects.first()
    return token.access_token


def get_qb_item_quantity(qb_item_id):
    token = get_qb_access_token()
    realm_id = settings.QB_REALM_ID

    url = f"https://sandbox-quickbooks.api.intuit.com/v3/company/{realm_id}/item/{qb_item_id}"

    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/json",
    }

    response = requests.get(url, headers=headers)

    response.raise_for_status()

    item = response.json()["Item"]

    return item.get("QtyOnHand", 0)

########################################################################################################################################
    """



"""
✅ QUÉ HACE ESTE SCRIPT (EN 10 SEGUNDOS)

✔ Centraliza TODAS las llamadas a QuickBooks
✔ Consulta stock real (QtyOnHand)
✔ Crea ventas reales (SalesReceipt)
✔ QuickBooks descuenta inventario automáticamente
✔ Devuelve el ID contable oficial
"""


# qb/services.py
import requests
from django.conf import settings
from .models import QuickBooksToken
from django.utils import timezone
from datetime import timedelta


# =========================
# TOKEN HELPERS
# =========================

def get_valid_access_token():
    token = QuickBooksToken.objects.first()
    if not token:
        raise Exception("QuickBooks no conectado")

    if token.expires_at > timezone.now():
        return token.access_token

    # Refresh token 
    token_url = "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer" # Endpoint estándar OAuth de Intuit 
    auth = (settings.QB_CLIENT_ID, settings.QB_CLIENT_SECRET)               #Se usa para:intercambiar authorization_code
                                                                            #refrescar access_token
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

# =========================
# 
# =========================
def get_qb_headers():
    """
    Headers estándar para llamadas a QuickBooks con token válido
    """
    return {
        "Authorization": f"Bearer {get_valid_access_token()}",
        "Accept": "application/json",
        "Content-Type": "application/json",
    }


# =========================
# CONSULTAR STOCK EN QUICKBOOKS
# =========================
"""
def get_qb_item_quantity(qb_item_id):
   
    Consulta la cantidad disponible (QtyOnHand) de un Item en QuickBooks
    
    token = QuickBooksToken.objects.first()
    url = f"https://sandbox-quickbooks.api.intuit.com/v3/company/{token.realm_id}/item/{qb_item_id}"

    response = requests.get(url, headers=get_qb_headers())
    response.raise_for_status()

    item = response.json()["Item"]
    return item.get("QtyOnHand", 0)

"""
# =========================
# CREAR SALES RECEIPT
# =========================

def create_sales_receipt(order):
    token = QuickBooksToken.objects.first()

    url = f"https://sandbox-quickbooks.api.intuit.com/v3/company/{token.realm_id}/salesreceipt"

    lines = []
    GENERIC_QB_ITEM_ID = "1"  # Item "Venta App"
    for item in order.items.all():
        lines.append({
            "DetailType": "SalesItemLineDetail",
            "Amount": float(item.price * item.quantity),
            "SalesItemLineDetail": {
                "ItemRef": {"value": GENERIC_QB_ITEM_ID },#item.product.qb_item_id
                "Qty": item.quantity,
                "UnitPrice": float(item.price),
            }
        })

    payload = {
        "Line": lines,
        "CustomerRef": {"value": "1"}  # Cliente genérico sandbox
    }

    response = requests.post(url, json=payload, headers=get_qb_headers())
    response.raise_for_status()

    return response.json()["SalesReceipt"]["Id"]


# =========================
# CREAR INVOICE (COD)
# =========================

def create_invoice(order):
    token = QuickBooksToken.objects.first()

    url = f"https://sandbox-quickbooks.api.intuit.com/v3/company/{token.realm_id}/invoice"

    lines = []

    for item in order.items.all():
        lines.append({
            "DetailType": "SalesItemLineDetail",
            "Amount": float(item.price * item.quantity),
            "SalesItemLineDetail": {
                "ItemRef": {"value": item.product.qb_item_id},
                "Qty": item.quantity,
                "UnitPrice": float(item.price),
            }
        })

    payload = {
        "Line": lines,
        "CustomerRef": {"value": "1"}
    }

    response = requests.post(url, json=payload, headers=get_qb_headers())
    response.raise_for_status()

    return response.json()["Invoice"]["Id"]
