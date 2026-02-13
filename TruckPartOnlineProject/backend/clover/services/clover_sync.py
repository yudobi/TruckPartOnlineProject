"""import requests
from decimal import Decimal
from django.conf import settings
from products.models import Product

CLOVER_BASE_URL = "https://sandbox.dev.clover.com/v3/merchants"

def sync_clover_prices():
    merchant_id = settings.CLOVER_MERCHANT_ID
    access_token = settings.CLOVER_ACCESS_TOKEN

    url = f"{CLOVER_BASE_URL}/{merchant_id}/items"

    headers = {
        "Authorization": f"Bearer {access_token}"
    }

    response = requests.get(url, headers=headers)

    if response.status_code != 200:
        print("Error al conectar con Clover:", response.text)
        return

    data = response.json()
    items = data.get("elements", [])

    for item in items:
        clover_id = item["id"]
        price_cents = item.get("price", 0)

        # Clover maneja precio en centavos
        price = Decimal(price_cents) / 100

        try:
            product = Product.objects.get(clover_item_id=clover_id)
            product.price = price
            product.save(update_fields=["price"])
            print(f"Actualizado: {product.name} → {price}")
        except Product.DoesNotExist:
            print(f"No existe producto con Clover ID {clover_id}")
#######################################################################################################
import requests
from decimal import Decimal
from clover.models import CloverMerchant, CloverProduct

def sync_clover_prices():
    merchant = CloverMerchant.objects.first()
    if not merchant:
        print("No hay merchant conectado")
        return

    url = f"https://sandbox.dev.clover.com/v3/merchants/{merchant.merchant_id}/items"
    headers = {"Authorization": f"Bearer {merchant.access_token}"}

    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        print("Error al conectar con Clover:", response.text)
        return

    items = response.json().get("elements", [])
    for item in items:
        clover_item_id = item["id"]
        price = Decimal(item.get("price", 0)) / 100
        name = item.get("name", "")

        product, created = CloverProduct.objects.update_or_create(
            merchant=merchant,
            clover_item_id=clover_item_id,
            defaults={"name": name, "price": price}
        )
        print(f"{'Creado' if created else 'Actualizado'}: {name} → {price}")

"""
##################################################################################################
import requests
from decimal import Decimal
from products.models import Product
from clover.oauth import refresh_clover_token


def sync_clover_prices(merchant):
    """
    Sincroniza precios desde Clover para un merchant
    

    Para produccion---------------url = f"https://api.clover.com/v3/merchants/{merchant.merchant_id}/items?limit=1000" 
    """

    url = f"https://sandbox.dev.clover.com/v3/merchants/{merchant.merchant_id}/items?limit=1000"
    headers = {"Authorization": f"Bearer {merchant.access_token}"}

    response = requests.get(url, headers=headers)

    # 🔄 Si token expiró, intentar refresh
    if response.status_code == 401 and merchant.refresh_token:
        print("Token expirado, renovando...")

        token_data = refresh_clover_token(merchant.refresh_token)
        merchant.access_token = token_data["access_token"]
        merchant.refresh_token = token_data.get("refresh_token", merchant.refresh_token)
        merchant.save(update_fields=["access_token", "refresh_token"])

        headers = {"Authorization": f"Bearer {merchant.access_token}"}
        response = requests.get(url, headers=headers)

    response.raise_for_status()

    items = response.json().get("elements", [])
    print("TOTAL ITEMS RECIBIDOS:", len(items))

    for item in items:
        clover_item_id = item.get("id")
        if not clover_item_id:
            continue

        price = Decimal(item.get("price", 0)) / 100
        name = item.get("name", "")

        product, created = Product.objects.update_or_create(
            clover_item_id=clover_item_id,
            defaults={
                "name": name,
                "price": price
            }
        )

        print(f"{'Creado' if created else 'Actualizado'}: {name} → {price}")
