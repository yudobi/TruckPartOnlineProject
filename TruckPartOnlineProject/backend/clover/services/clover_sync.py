
##################################################################################################
import requests
from decimal import Decimal
from django.conf import settings
from products.models import Product
from clover.oauth import refresh_clover_token


def sync_clover_prices(merchant):
    """
    Sincroniza precios desde Clover para un merchant.
    Funciona automáticamente en sandbox o producción según CLOVER_ENV.
    """

    url = (
        f"{settings.CLOVER['BASE_URL']}/v3/merchants/"
        f"{merchant.merchant_id}/items?limit=1000"
    )

    headers = {
        "Authorization": f"Bearer {merchant.access_token}"
    }

    response = requests.get(url, headers=headers)

    # 🔄 Si token expiró, intentar refresh automáticamente
    if response.status_code == 401 and merchant.refresh_token:
        print("🔄 Token expirado, renovando...")

        token_data = refresh_clover_token(merchant.refresh_token)

        merchant.access_token = token_data["access_token"]
        merchant.refresh_token = token_data.get(
            "refresh_token",
            merchant.refresh_token
        )
        merchant.save(update_fields=["access_token", "refresh_token"])

        headers["Authorization"] = f"Bearer {merchant.access_token}"
        response = requests.get(url, headers=headers)

    response.raise_for_status()

    items = response.json().get("elements", [])
    print("✅ TOTAL ITEMS RECIBIDOS:", len(items))

    for item in items:
        clover_item_id = item.get("id")
        if not clover_item_id:
            continue

        price_cents = item.get("price", 0) or 0
        price = Decimal(price_cents) / Decimal("100")

        name = item.get("name") or ""

        product, created = Product.objects.update_or_create(
            clover_item_id=clover_item_id,
            defaults={
                "name": name,
                "price": price,
            }
        )

        print(
            f"{'🆕 Creado' if created else '♻️ Actualizado'}: "
            f"{name} → {price}"
        )
