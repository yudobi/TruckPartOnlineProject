#from qb.services import get_qb_item_quantity
from products.models import Product

"""
##################################VALIDAR STOCK DE QUICKBOOKS ANTES DEL CHECKOUT #####################################################################################
def validate_order_stock(items):
    
    #items = [
        #{"product_id": 1, "quantity": 2},
        #...
   # ]
    

    for item in items:
        product = Product.objects.get(id=item["product_id"])

        available = get_qb_item_quantity(product.qb_item_id)

        if item["quantity"] > available:
            raise ValueError(
                f"Stock insuficiente para {product.name}. "
                f"Disponible: {available}"
            )

    return True
######################################################################
"""
##################################VALIDAR STOCK INTERNO ANTES DEL CHECKOUT #####################################################################################

def validate_order_stock(items):
    for item in items:
        product = Product.objects.select_for_update().get(
            id=item["product_id"]
        )

        if item["quantity"] > product.stock:
            raise ValueError(
                f"Stock insuficiente para {product.name}. "
                f"Disponible: {product.stock}"
            )

    return True