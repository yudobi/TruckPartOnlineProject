from .models import Order,OrderItem
from rest_framework import serializers

class OrderSerializer(serializers.ModelSerializer):
    items = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            "id",
            #Datos del cliente (si es guest, se llenan con la info del checkout)
            "full_name",
            "guest_email",
            "phone",
            #Datos de envío
            "street",
            "house_number",
            "state",
            "city",
            "postal_code",
            #Datos de la orden
            "status",
            "payment_method",
            "payment_status",
            "qb_invoice_id",
            "qb_sales_receipt_id",
            "items",
            "total",
            "created_at"
        ]

    def get_items(self, obj):
        items = obj.items.all()
        return [
            {
                "product": item.product.name,
                "quantity": item.quantity,
                "price": float(item.price)
            }
            for item in items
        ]
