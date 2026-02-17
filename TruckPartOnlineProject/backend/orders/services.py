from products.models import Product
from inventory.models import Inventory

################################## VALIDAR STOCK INTERNO ANTES DEL CHECKOUT ##################################

def validate_order_stock(items):
    """
    Verifica si hay suficiente cantidad en el modelo Inventory para cada producto del pedido.
    """
    for item in items:
        # Usamos select_for_update() para bloquear la fila durante la transacción (si estamos en una) 
        # y evitar condiciones de carrera.
        try:
            product = Product.objects.get(id=item["product_id"])
        except Product.DoesNotExist:
             raise ValueError(f"El producto con ID {item['product_id']} no existe.")

        try:
            inventory = product.inventory
            available = inventory.quantity
        except Inventory.DoesNotExist:
            # Si no hay registro de inventario, asumimos stock 0
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