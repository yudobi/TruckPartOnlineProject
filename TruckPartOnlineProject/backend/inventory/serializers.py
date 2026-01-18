from rest_framework import serializers
from .models import Inventory, InventoryMovement

##############PARA VER STOK#############################
class InventorySerializer(serializers.ModelSerializer):
    product_id = serializers.IntegerField(source="product.id", read_only=True)
    product_name = serializers.CharField(source="product.name", read_only=True)

    class Meta:
        model = Inventory
        fields = [
            "id",
            "product_id",
            "product_name",
            "quantity",
            "updated_at",
        ]


##############PARA VER ISTORIAL#############################
class InventoryMovementSerializer(serializers.ModelSerializer):
    class Meta:
        model = InventoryMovement
        fields = [
            "id",
            "change",
            "reason",
            "reference",
            "created_at",
        ]
