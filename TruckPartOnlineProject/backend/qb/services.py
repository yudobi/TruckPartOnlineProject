import requests
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
from .models import QuickBooksToken

import re
from typing import Optional, Dict, List
import requests


# =====================================================================================================================
# TOKEN
# =====================================================================================================================

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


# =====================================================================================================================
# HEADERS
# =====================================================================================================================

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




######################################################################################################################
# ====================================================================================================================



def _generate_phone_formats(phone_digits: str) -> list:
    """
    Genera diferentes formatos para un número de teléfono de 10 dígitos.
    Útil para buscar en QuickBooks que puede tener diferentes formatos.
    """
    if len(phone_digits) != 10:
        return []
    
    area = phone_digits[:3]      # 650
    prefix = phone_digits[3:6]    # 555
    line = phone_digits[6:]       # 3311
    
    return [
        f"({area}) {prefix}-{line}",  # (650) 555-3311
        f"{area}-{prefix}-{line}",    # 650-555-3311
        f"{area}.{prefix}.{line}",    # 650.555.3311
        f"{area} {prefix} {line}",    # 650 555 3311
        f"+1{area}{prefix}{line}",    # +16505553311
        f"+1-{area}-{prefix}-{line}", # +1-650-555-3311
        phone_digits,                  # 6505553311
    ]


######################################################################################################################


def find_customer_by_phone(token, phone):
    """
    Versión FINAL que funciona: obtiene todos los clientes y filtra en Python
    """
    if not phone:
        return None
    
    print(f"🔍 Buscando teléfono: '{phone}'")
    
    # Limpiar teléfono de búsqueda
    phone_clean = re.sub(r'\D', '', phone)
    print(f"   Limpio: '{phone_clean}'")
    
    url = f"https://sandbox-quickbooks.api.intuit.com/v3/company/{token.realm_id}/query"
    headers = qb_headers_query()
    
    # 1. Obtener TODOS los clientes (sin filtro)
    query = "SELECT * FROM Customer"
    print(f"\n📞 Obteniendo todos los clientes...")
    
    try:
        response = requests.post(url, data=query, headers=headers)
        
        if response.status_code != 200:
            print(f"❌ Error obteniendo clientes: {response.status_code}")
            return None
        
        data = response.json()
        all_customers = data.get("QueryResponse", {}).get("Customer", [])
        
        print(f"📊 Total clientes en QuickBooks: {len(all_customers)}")
        
        # 2. Filtrar manualmente por teléfono en Python
        matching_customers = []
        
        for customer in all_customers:
            # Obtener teléfono del cliente
            phone_field = customer.get('PrimaryPhone', {})
            customer_phone = phone_field.get('FreeFormNumber', '')
            
            if not customer_phone:
                continue
            
            # Limpiar teléfono del cliente
            customer_phone_clean = re.sub(r'\D', '', customer_phone)
            
            # Comparar
            if phone_clean == customer_phone_clean:
                matching_customers.append(customer)
                print(f"\n   ✅ Coincidencia encontrada:")
                print(f"      ID: {customer['Id']}")
                print(f"      Nombre: {customer.get('DisplayName', 'N/A')}")
                print(f"      Tel en QB: '{customer_phone}'")
                print(f"      Tel limpio: '{customer_phone_clean}'")
        
        # 3. Seleccionar el mejor cliente
        if not matching_customers:
            print(f"\n❌ No se encontraron clientes con teléfono {phone}")
            return None
        
        if len(matching_customers) == 1:
            print(f"\n✅ Cliente único encontrado")
            return matching_customers[0]
        
        # Múltiples coincidencias
        print(f"\n⚠️ Se encontraron {len(matching_customers)} clientes:")
        for c in matching_customers:
            print(f"   - ID: {c['Id']} - {c.get('DisplayName', 'N/A')} - Balance: ${c.get('Balance', 0)}")
        
        # Priorizar el cliente original (sin sufijo)
        for c in matching_customers:
            name = c.get('DisplayName', '')
            if name == "Jorge Antonio Ramirez":
                print(f"\n✅ SELECCIONADO (original): {name}")
                return c
        
        # Si no, elegir el de menor balance (el original suele tener balance 0)
        best = min(matching_customers, key=lambda x: float(x.get('Balance', 0)))
        print(f"\n⚠️ SELECCIONADO (menor balance): {best.get('DisplayName')}")
        return best
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        return None



###################################################################################################################



def find_customer_by_email(token, email):
    """
    Busca cliente por email - Versión OPTIMIZADA que funciona con la API de QuickBooks
    """
    if not email:
        return None
    
    print(f"🔍 Buscando email: '{email}'")
    
    # Limpiar email (minúsculas, sin espacios)
    email_clean = email.strip().lower()
    print(f"   Limpio: '{email_clean}'")
    
    url = f"https://sandbox-quickbooks.api.intuit.com/v3/company/{token.realm_id}/query"
    headers = qb_headers_query()
    
    # 1. Obtener TODOS los clientes
    query = "SELECT * FROM Customer"
    print(f"\n📧 Obteniendo todos los clientes...")
    
    try:
        response = requests.post(url, data=query, headers=headers)
        
        if response.status_code != 200:
            print(f"❌ Error obteniendo clientes: {response.status_code}")
            return None
        
        data = response.json()
        all_customers = data.get("QueryResponse", {}).get("Customer", [])
        
        print(f"📊 Total clientes en QuickBooks: {len(all_customers)}")
        
        # 2. Filtrar manualmente por email en Python
        matching_customers = []
        
        for customer in all_customers:
            # Obtener email del cliente
            email_field = customer.get('PrimaryEmailAddr', {})
            customer_email = email_field.get('Address', '')
            
            if not customer_email:
                continue
            
            # Limpiar email del cliente
            customer_email_clean = customer_email.strip().lower()
            
            # Comparación exacta primero
            if email_clean == customer_email_clean:
                matching_customers.append(customer)
                print(f"\n   ✅ Coincidencia EXACTA encontrada:")
                print(f"      ID: {customer['Id']}")
                print(f"      Nombre: {customer.get('DisplayName', 'N/A')}")
                print(f"      Email en QB: '{customer_email}'")
                return customer  # Si hay coincidencia exacta, retornar inmediatamente
            
            # Si no es exacta, guardar para posible coincidencia parcial después
            if email_clean in customer_email_clean:
                matching_customers.append(customer)
                print(f"\n   📌 Coincidencia PARCIAL encontrada:")
                print(f"      ID: {customer['Id']}")
                print(f"      Nombre: {customer.get('DisplayName', 'N/A')}")
                print(f"      Email en QB: '{customer_email}'")
        
        # 3. Si no hubo coincidencia exacta, analizar coincidencias parciales
        if not matching_customers:
            print(f"\n❌ No se encontraron clientes con email {email}")
            return None
        
        if len(matching_customers) == 1:
            print(f"\n✅ Cliente único encontrado (coincidencia parcial)")
            return matching_customers[0]
        
        # Múltiples coincidencias parciales
        print(f"\n⚠️ Se encontraron {len(matching_customers)} clientes con email similar:")
        for idx, c in enumerate(matching_customers, 1):
            email_mostrar = c.get('PrimaryEmailAddr', {}).get('Address', 'N/A')
            print(f"   {idx}. ID: {c['Id']} - {c.get('DisplayName', 'N/A')} - Email: '{email_mostrar}' - Balance: ${c.get('Balance', 0)}")
        
        # Priorizar el cliente original (sin sufijo)
        for c in matching_customers:
            name = c.get('DisplayName', '')
            if 'Jorge Antonio Ramirez' in name and '-' not in name:
                print(f"\n✅ SELECCIONADO (original por nombre): {c.get('DisplayName')} (ID: {c['Id']})")
                return c
        
        # Si no, elegir el de menor balance
        best = min(matching_customers, key=lambda x: float(x.get('Balance', 0)))
        print(f"\n⚠️ SELECCIONADO (menor balance): {best.get('DisplayName')} (ID: {best['Id']})")
        return best
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        return None


# ====================================================================================================================
# CREAR CLIENTE
# ===================================================================================================================

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


# =====================================================================================================================
# OBTENER O CREAR CLIENTE
# ====================================================================================================================

def get_or_create_customer(token, order):
    """Versión que usa la nueva búsqueda por teléfono (AHORA FUNCIONA)"""
    
    if order.qb_customer_id:
        return order.qb_customer_id
    
    # Buscar por teléfono (AHORA SÍ FUNCIONA)
    customer = None
    if order.phone:
        customer = find_customer_by_phone(token, order.phone)  # Usa la nueva función
        if customer:
            print(f"✅ Cliente encontrado por teléfono: {customer['DisplayName']} (ID: {customer['Id']})")
    
    # Si no encuentra, buscar por email (también necesitará actualización similar)
    if not customer and order.guest_email:
        customer = find_customer_by_email(token, order.guest_email)
        if customer:
            print(f"✅ Cliente encontrado por email: {customer['DisplayName']}")
    
    # Si no existe, crear nuevo
    if not customer:
        print(f"🆕 Creando NUEVO cliente para orden {order.id}")
        customer = create_customer(token, order)
    else:
        print(f"✅ Usando cliente EXISTENTE")
    
    # Guardar en la orden
    order.qb_customer_id = customer["Id"]
    order.save(update_fields=["qb_customer_id"])
    
    return customer["Id"]

###########################################################################################################################
# ====================================================================================================================
# CREAR SALES RECEIPT
# ====================================================================================================================

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

########################################################################################################################
# ====================================================================================================================
# CREAR FACTURA
# ====================================================================================================================

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

##########################################################################################################################
