from django.db import transaction
from django.core.exceptions import ValidationError

from inventory.models import Inventory, InventoryMovement

def get_inventory(product):
    return Inventory.objects.select_for_update().get(product=product)

@transaction.atomic
def move_inventory(
    *,
    product,
    quantity_change,
    reason,
    reference=None
):
    """
    quantity_change:
        +n -> entrada
        -n -> salida
    """

    inventory = get_inventory(product)

    new_quantity = inventory.quantity + quantity_change

    if new_quantity < 0:
        raise ValidationError(
            f"Stock insuficiente para {product.name}"
        )

    inventory.quantity = new_quantity
    inventory.save()

    InventoryMovement.objects.create(
        inventory=inventory,
        change=quantity_change,
        reason=reason,
        reference=reference
    )

    return inventory.quantity


################################################
def validate_stock(product, quantity):
    inventory = Inventory.objects.select_related("product").get(
        product=product
    )
    return inventory.quantity >= quantity
