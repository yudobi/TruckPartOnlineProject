import requests
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
from .models import QuickBooksToken


# =====================================================
# TOKEN
# =====================================================

def get_valid_access_token():

    token = QuickBooksToken.objects.first()

    if not token:
        raise Exception("QuickBooks no conectado")

    if token.expires_at > timezone.now():
        return token.access_token

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


# =====================================================
# HEADERS
# =====================================================

def qb_headers_json():
    return {
        "Authorization": f"Bearer {get_valid_access_token()}",
        "Accept": "application/json",
        "Content-Type": "application/json"
    }


def qb_headers_query():
    return {
        "Authorization": f"Bearer {get_valid_access_token()}",
        "Accept": "application/json",
        "Content-Type": "application/text"
    }


# =====================================================
# BUSCAR CLIENTES
# =====================================================

def find_customer_by_phone(token, phone):

    if not phone:
        return None

    url = f"https://sandbox-quickbooks.api.intuit.com/v3/company/{token.realm_id}/query"

    query = f"SELECT * FROM Customer WHERE PrimaryPhone.FreeFormNumber = '{phone}'"

    r = requests.post(url, data=query, headers=qb_headers_query())

    if r.status_code != 200:
        return None

    data = r.json()

    customers = data.get("QueryResponse", {}).get("Customer", [])

    return customers[0] if customers else None


def find_customer_by_email(token, email):

    if not email:
        return None

    url = f"https://sandbox-quickbooks.api.intuit.com/v3/company/{token.realm_id}/query"

    query = f"SELECT * FROM Customer WHERE PrimaryEmailAddr.Address = '{email}'"

    r = requests.post(url, data=query, headers=qb_headers_query())

    if r.status_code != 200:
        return None

    data = r.json()

    customers = data.get("QueryResponse", {}).get("Customer", [])

    return customers[0] if customers else None


# =====================================================
# CREAR CLIENTE
# =====================================================

def create_customer(token, order):

    name = order.full_name or f"Cliente-{order.id}"

    url = f"https://sandbox-quickbooks.api.intuit.com/v3/company/{token.realm_id}/customer"

    payload = {
        "DisplayName": f"{name}-{order.id}"
    }

    if order.phone:
        payload["PrimaryPhone"] = {
            "FreeFormNumber": order.phone
        }

    if order.guest_email:
        payload["PrimaryEmailAddr"] = {
            "Address": order.guest_email
        }

    response = requests.post(
        url,
        json=payload,
        headers=qb_headers_json()
    )

    print("CREATE CUSTOMER:", response.status_code)
    print(response.text)

    response.raise_for_status()

    return response.json()["Customer"]


# =====================================================
# OBTENER O CREAR CLIENTE
# =====================================================

def get_or_create_customer(token, order):

    if order.qb_customer_id:
        return order.qb_customer_id

    customer = find_customer_by_phone(token, order.phone)

    if not customer:
        customer = find_customer_by_email(token, order.guest_email)

    if not customer:
        customer = create_customer(token, order)

    customer_id = customer["Id"]

    order.qb_customer_id = customer_id
    order.save(update_fields=["qb_customer_id"])

    return customer_id


# =====================================================
# CREAR SALES RECEIPT
# =====================================================

def create_sales_receipt(order):

    token = QuickBooksToken.objects.first()

    if order.qb_sales_receipt_id:
        print("⚠️ SalesReceipt ya existe:", order.qb_sales_receipt_id)
        return order.qb_sales_receipt_id

    customer_id = get_or_create_customer(token, order)

    lines = []

    for item in order.items.all():

        lines.append({
            "DetailType": "SalesItemLineDetail",
            "Amount": float(item.price * item.quantity),
            "Description": f"{item.product.name} x {item.quantity}",
            "SalesItemLineDetail": {
                "ItemRef": {
                    "value": item.product.qb_item_id
                },
                "Qty": item.quantity,
                "UnitPrice": float(item.price)
            }
        })

    payload = {
        "Line": lines,
        "CustomerRef": {
            "value": customer_id
        }
    }

    url = f"https://sandbox-quickbooks.api.intuit.com/v3/company/{token.realm_id}/salesreceipt"

    r = requests.post(url, json=payload, headers=qb_headers_json())

    print("CREATE SALES RECEIPT:", r.status_code)
    print(r.text)

    r.raise_for_status()

    receipt_id = r.json()["SalesReceipt"]["Id"]

    order.qb_sales_receipt_id = receipt_id
    order.save(update_fields=["qb_sales_receipt_id"])

    print("✅ SalesReceipt creado:", receipt_id)

    return receipt_id


# =====================================================
# CREAR FACTURA
# =====================================================

def create_invoice(order):

    token = QuickBooksToken.objects.first()

    if order.qb_invoice_id:
        print("⚠️ Invoice ya existe:", order.qb_invoice_id)
        return order.qb_invoice_id

    customer_id = get_or_create_customer(token, order)

    lines = []

    for item in order.items.all():

        lines.append({
            "DetailType": "SalesItemLineDetail",
            "Amount": float(item.price * item.quantity),
            "Description": f"{item.product.name} x {item.quantity}",
            "SalesItemLineDetail": {
                "ItemRef": {
                    "value": item.product.qb_item_id
                },
                "Qty": item.quantity,
                "UnitPrice": float(item.price)
            }
        })

    payload = {
        "Line": lines,
        "CustomerRef": {
            "value": customer_id
        }
    }

    url = f"https://sandbox-quickbooks.api.intuit.com/v3/company/{token.realm_id}/invoice"

    r = requests.post(url, json=payload, headers=qb_headers_json())

    print("CREATE INVOICE:", r.status_code)
    print(r.text)

    r.raise_for_status()

    invoice_id = r.json()["Invoice"]["Id"]

    order.qb_invoice_id = invoice_id
    order.save(update_fields=["qb_invoice_id"])

    print("✅ Invoice creada:", invoice_id)

    return invoice_id