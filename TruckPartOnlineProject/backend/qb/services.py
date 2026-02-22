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
"""
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
"""

# ============================================
# CREAR SALES RECEIPT CON CLIENTE REAL
# ============================================

def create_sales_receipt(order):
    token = QuickBooksToken.objects.first()
    
    url = f"https://sandbox-quickbooks.api.intuit.com/v3/company/{token.realm_id}/salesreceipt"
    
    # ============================================
    # 1. BUSCAR O CREAR EL CLIENTE EN QUICKBOOKS POR TELÉFONO
    # ============================================
    customer_name = order.full_name or f"Cliente {order.id}"
    customer_id = None
    
    # Buscar si el cliente ya existe por número de teléfono
    if order.phone:
        search_url = f"https://sandbox-quickbooks.api.intuit.com/v3/company/{token.realm_id}/query"
        search_query = f"SELECT * FROM Customer WHERE PrimaryPhone = '{order.phone}'"
        print(f"🔍 Buscando cliente por teléfono: {order.phone}")
        
        search_response = requests.post(search_url, data=search_query, headers=get_qb_headers())
        
        if search_response.status_code == 200:
            search_data = search_response.json()
            customers = search_data.get('QueryResponse', {}).get('Customer', [])
            
            if customers:
                customer_id = customers[0]['Id']
                customer_name = customers[0].get('DisplayName', customer_name)
                print(f"✅ Cliente existente encontrado por teléfono: {customer_name} (ID: {customer_id}, Tel: {order.phone})")
    
    # Si no existe por teléfono, buscar por email como respaldo
    if not customer_id and order.guest_email:
        search_url = f"https://sandbox-quickbooks.api.intuit.com/v3/company/{token.realm_id}/query"
        search_query = f"SELECT * FROM Customer WHERE PrimaryEmailAddr = '{order.guest_email}'"
        print(f"🔍 Buscando cliente por email (fallback): {order.guest_email}")
        
        search_response = requests.post(search_url, data=search_query, headers=get_qb_headers())
        
        if search_response.status_code == 200:
            search_data = search_response.json()
            customers = search_data.get('QueryResponse', {}).get('Customer', [])
            
            if customers:
                customer_id = customers[0]['Id']
                customer_name = customers[0].get('DisplayName', customer_name)
                print(f"✅ Cliente existente encontrado por email: {customer_name} (ID: {customer_id})")
    
    # Si no existe, crear nuevo cliente
    if not customer_id:
        create_customer_url = f"https://sandbox-quickbooks.api.intuit.com/v3/company/{token.realm_id}/customer"
        
        customer_payload = {
            "DisplayName": customer_name,
            "GivenName": order.full_name.split()[0] if order.full_name else "Cliente",
            "FamilyName": " ".join(order.full_name.split()[1:]) if order.full_name and len(order.full_name.split()) > 1 else "",
            "PrimaryEmailAddr": {
                "Address": order.guest_email or ""
            },
            "PrimaryPhone": {
                "FreeFormNumber": order.phone or ""
            }
        }
        
        # Agregar dirección si está disponible
        if order.shipping_address or any([order.street, order.city, order.state, order.postal_code]):
            address_lines = []
            if order.street:
                address_lines.append(order.street)
            if order.house_number:
                address_lines.append(order.house_number)
            
            customer_payload["BillAddr"] = {
                "Line1": " ".join(address_lines) if address_lines else "",
                "Line2": order.shipping_address or "",
                "City": order.city or "",
                "Country": order.country or "",
                "PostalCode": order.postal_code or "",
                "CountrySubDivisionCode": order.state or ""
            }
        
        print(f"➕ Creando nuevo cliente: {customer_name} (Tel: {order.phone})")
        customer_response = requests.post(create_customer_url, json=customer_payload, headers=get_qb_headers())
        customer_response.raise_for_status()
        customer_data = customer_response.json()
        customer_id = customer_data["Customer"]["Id"]
        print(f"✅ Nuevo cliente creado: {customer_name} (ID: {customer_id})")
    
    # ============================================
    # 2. CREAR LAS LÍNEAS DEL RECIBO
    # ============================================
    lines = []
    for item in order.items.all():
        lines.append({
            "DetailType": "SalesItemLineDetail",
            "Amount": float(item.price * item.quantity),
            "SalesItemLineDetail": {
                "ItemRef": {"value": item.product.qb_item_id},
                "Qty": item.quantity,
                "UnitPrice": float(item.price),
            },
            "Description": f"{item.product.name} x {item.quantity}"
        })
    
    # ============================================
    # 3. CREAR EL RECIBO CON EL CLIENTE CORRECTO
    # ============================================
    payload = {
        "Line": lines,
        "CustomerRef": {"value": customer_id}
    }
    
    response = requests.post(url, json=payload, headers=get_qb_headers())
    response.raise_for_status()
    
    receipt_id = response.json()["SalesReceipt"]["Id"]
    print(f"✅ Sales Receipt creado: {receipt_id} para cliente: {customer_name} (Tel: {order.phone})")
    
    return receipt_id

# =========================
# CREAR INVOICE (COD)
# =========================
"""
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
"""

# ============================================
# CREAR INVOICE 
# ============================================

def create_invoice(order):
    token = QuickBooksToken.objects.first()
    
    url = f"https://sandbox-quickbooks.api.intuit.com/v3/company/{token.realm_id}/invoice"
    
    # ============================================
    # 1. BUSCAR O CREAR EL CLIENTE EN QUICKBOOKS POR TELÉFONO
    # ============================================
    customer_name = order.full_name or f"Cliente {order.id}"
    customer_id = None
    
    # Buscar si el cliente ya existe por número de teléfono
    if order.phone:
        search_url = f"https://sandbox-quickbooks.api.intuit.com/v3/company/{token.realm_id}/query"
        # Buscar por PrimaryPhone (FORMATO CORREGIDO)
        search_query = f"SELECT * FROM Customer WHERE PrimaryPhone = '{order.phone}'"
        print(f"🔍 Buscando cliente por teléfono: {order.phone}")
        
        search_response = requests.post(search_url, data=search_query, headers=get_qb_headers())
        
        if search_response.status_code == 200:
            search_data = search_response.json()
            customers = search_data.get('QueryResponse', {}).get('Customer', [])
            
            if customers:
                customer_id = customers[0]['Id']
                customer_name = customers[0].get('DisplayName', customer_name)
                print(f"✅ Cliente existente encontrado por teléfono: {customer_name} (ID: {customer_id}, Tel: {order.phone})")
    
    # Si no existe por teléfono, buscar por email como respaldo
    if not customer_id and order.guest_email:
        search_url = f"https://sandbox-quickbooks.api.intuit.com/v3/company/{token.realm_id}/query"
        search_query = f"SELECT * FROM Customer WHERE PrimaryEmailAddr = '{order.guest_email}'"
        print(f"🔍 Buscando cliente por email (fallback): {order.guest_email}")
        
        search_response = requests.post(search_url, data=search_query, headers=get_qb_headers())
        
        if search_response.status_code == 200:
            search_data = search_response.json()
            customers = search_data.get('QueryResponse', {}).get('Customer', [])
            
            if customers:
                customer_id = customers[0]['Id']
                customer_name = customers[0].get('DisplayName', customer_name)
                print(f"✅ Cliente existente encontrado por email: {customer_name} (ID: {customer_id})")
    
    # Si no existe, crear nuevo cliente
    if not customer_id:
        create_customer_url = f"https://sandbox-quickbooks.api.intuit.com/v3/company/{token.realm_id}/customer"
        
        customer_payload = {
            "DisplayName": customer_name,
            "GivenName": order.full_name.split()[0] if order.full_name else "Cliente",
            "FamilyName": " ".join(order.full_name.split()[1:]) if order.full_name and len(order.full_name.split()) > 1 else "",
            "PrimaryEmailAddr": {
                "Address": order.guest_email or ""
            },
            "PrimaryPhone": {
                "FreeFormNumber": order.phone or ""
            }
        }
        
        # Agregar dirección si está disponible
        if order.shipping_address or any([order.street, order.city, order.state, order.postal_code]):
            # Construir dirección en formato adecuado para QuickBooks
            address_lines = []
            if order.street:
                address_lines.append(order.street)
            if order.house_number:
                address_lines.append(order.house_number)
            
            customer_payload["BillAddr"] = {
                "Line1": " ".join(address_lines) if address_lines else "",
                "Line2": order.shipping_address or "",
                "City": order.city or "",
                "Country": order.country or "",
                "PostalCode": order.postal_code or "",
                "CountrySubDivisionCode": order.state or ""
            }
        
        print(f"➕ Creando nuevo cliente: {customer_name} (Tel: {order.phone})")
        customer_response = requests.post(create_customer_url, json=customer_payload, headers=get_qb_headers())
        customer_response.raise_for_status()
        customer_data = customer_response.json()
        customer_id = customer_data["Customer"]["Id"]
        print(f"✅ Nuevo cliente creado: {customer_name} (ID: {customer_id})")
    
    # ============================================
    # 2. CREAR LAS LÍNEAS DE LA FACTURA
    # ============================================
    lines = []
    for item in order.items.all():
        lines.append({
            "DetailType": "SalesItemLineDetail",
            "Amount": float(item.price * item.quantity),
            "SalesItemLineDetail": {
                "ItemRef": {"value": item.product.qb_item_id},
                "Qty": item.quantity,
                "UnitPrice": float(item.price),
            },
            "Description": f"{item.product.name} x {item.quantity}"
        })
    
    # ============================================
    # 3. CREAR LA FACTURA CON EL CLIENTE CORRECTO
    # ============================================
    payload = {
        "Line": lines,
        "CustomerRef": {"value": customer_id}
    }
    
    response = requests.post(url, json=payload, headers=get_qb_headers())
    response.raise_for_status()
    
    invoice_id = response.json()["Invoice"]["Id"]
    print(f"✅ Invoice creado: {invoice_id} para cliente: {customer_name} (Tel: {order.phone})")
    
    return invoice_id