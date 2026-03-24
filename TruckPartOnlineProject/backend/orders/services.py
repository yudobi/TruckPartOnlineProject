
# orders/services.py

from products.models import Product
from inventory.models import Inventory
from django.db import transaction

def validate_order_stock(items):
    """
    Verifica si hay suficiente cantidad en el modelo Inventory para cada producto del pedido.
    Usa select_for_update() para evitar condiciones de carrera durante la validación.
    """
    # Ordenamos los IDs para evitar deadlocks
    product_ids = sorted([item["product_id"] for item in items])
    
    # Obtenemos los productos con un lock para actualización
    products = Product.objects.select_for_update().filter(id__in=product_ids)
    
    if len(products) != len(items):
        raise ValueError("Uno o más productos no existen.")
    
    product_dict = {p.id: p for p in products}
    
    for item in items:
        product = product_dict.get(item["product_id"])
        if not product:
            raise ValueError(f"El producto con ID {item['product_id']} no existe.")
        
        try:
            # Accedemos al inventario a través de la relación
            # Si usas select_for_update en el producto, también deberías obtener el inventario con lock
            # inventory = Inventory.objects.select_for_update().get(product=product) 
            # Pero como estamos en una transacción atómica, podemos hacerlo así:
            inventory = product.inventory
            available = inventory.quantity
        except Inventory.DoesNotExist:
            available = 0

        if item["quantity"] > available:
            raise ValueError(
                f"Stock insuficiente para {product.name}. "
                f"Disponible: {available}"
            )

    return True


################################## COMENTADO: QUICKBOOKS VALIDATION ##################################
# from qb.services import get_qb_item_quantity
# def validate_order_stock_qb(items):
#     for item in items:
#         product = Product.objects.get(id=item["product_id"])
#         available = get_qb_item_quantity(product.qb_item_id)
#         if item["quantity"] > available:
#             raise ValueError(f"Stock insuficiente para {product.name}. Disponible: {available}")
#     return True


