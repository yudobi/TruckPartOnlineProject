"""
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
"""

# orders/serializers.py
from .models import Order, OrderItem
from rest_framework import serializers
from products.models import Product
from products.serializers import ProductSerializer  # Si tienes un serializer de producto

class OrderItemSerializer(serializers.ModelSerializer):
    """
    Serializer para los items de la orden con información completa del producto
    """
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_sku = serializers.CharField(source='product.sku', read_only=True)
    product_price = serializers.DecimalField(source='product.price', read_only=True, max_digits=10, decimal_places=2)
    product_id = serializers.IntegerField(source='product.id', read_only=True)
    subtotal = serializers.SerializerMethodField()
    
    class Meta:
        model = OrderItem
        fields = [
            'id',
            'product_id',
            'product_name',
            'product_sku',
            'quantity',
            'price',  # Precio al momento de la compra
            'product_price',  # Precio actual del producto
            'subtotal'
        ]
    
    def get_subtotal(self, obj):
        return float(obj.price * obj.quantity)


class OrderSerializer(serializers.ModelSerializer):
    """
    Serializer principal para órdenes con información detallada
    """
    items = OrderItemSerializer(many=True, read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    items_count = serializers.SerializerMethodField()
    total_formatted = serializers.SerializerMethodField()
    created_at_formatted = serializers.SerializerMethodField()
    
    class Meta:
        model = Order
        fields = [
            "id",
            # Datos del cliente
            "user",
            "user_email",
            "full_name",
            "guest_email",
            "phone",
            "is_guest",
            # Datos de envío
            "street",
            "house_number",
            "city",
            "state",
            "country",
            "postal_code",
            "shipping_address",  # Campo combinado si existe
            # Datos de la orden
            "status",
            "payment_method",
            "payment_status",
            "total",
            "total_formatted",
            "items_count",
            "items",
            # QuickBooks
            "qb_invoice_id",
            "qb_sales_receipt_id",
            "qb_customer_id",
            # Stripe
            "stripe_payment_intent",
            "stripe_client_secret",
            # Fechas
            "created_at",
            "created_at_formatted"
        ]
        read_only_fields = [
            'id', 'user', 'status', 'payment_status', 'total',
            'qb_invoice_id', 'qb_sales_receipt_id', 'stripe_payment_intent',
            'stripe_client_secret', 'created_at'
        ]
    
    def get_items_count(self, obj):
        return obj.items.count()
    
    def get_total_formatted(self, obj):
        return f"${float(obj.total):.2f}"
    
    def get_created_at_formatted(self, obj):
        return obj.created_at.strftime("%Y-%m-%d %H:%M:%S")


class OrderCreateSerializer(serializers.Serializer):
    """
    Serializer para crear una nueva orden (checkout)
    """
    items = serializers.ListField(
        child=serializers.DictField(),
        write_only=True,
        required=True
    )
    full_name = serializers.CharField(max_length=255, required=True)
    guest_email = serializers.EmailField(required=False, allow_null=True)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    shipping_address = serializers.CharField(required=False, allow_blank=True)
    street = serializers.CharField(max_length=255, required=False, allow_blank=True)
    house_number = serializers.CharField(max_length=20, required=False, allow_blank=True)
    city = serializers.CharField(max_length=100, required=False, allow_blank=True)
    state = serializers.CharField(max_length=100, required=False, allow_blank=True)
    country = serializers.CharField(max_length=100, required=False, allow_blank=True)
    postal_code = serializers.CharField(max_length=20, required=False, allow_blank=True)
    payment_method = serializers.ChoiceField(
        choices=['card', 'cod'],
        required=True
    )
    
    def validate_items(self, value):
        """
        Validar que los items tengan la estructura correcta
        """
        if not value:
            raise serializers.ValidationError("Se requiere al menos un producto")
        
        for item in value:
            if 'product_id' not in item:
                raise serializers.ValidationError("Cada item debe tener 'product_id'")
            if 'quantity' not in item:
                raise serializers.ValidationError("Cada item debe tener 'quantity'")
            
            try:
                quantity = int(item['quantity'])
                if quantity <= 0:
                    raise serializers.ValidationError("La cantidad debe ser mayor a 0")
            except (TypeError, ValueError):
                raise serializers.ValidationError("'quantity' debe ser un número entero")
        
        return value
    
    def validate_payment_method(self, value):
        """
        Validar el método de pago
        """
        if value not in ['card', 'cod']:
            raise serializers.ValidationError("Método de pago no válido")
        return value
    
    def validate(self, data):
        """
        Validaciones cruzadas
        """
        # Si no hay usuario autenticado, guest_email es requerido
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            if not data.get('guest_email'):
                raise serializers.ValidationError({
                    'guest_email': "El email es requerido para invitados"
                })
        
        return data


class OrderUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer para actualizar órdenes (admin)
    """
    class Meta:
        model = Order
        fields = ['status', 'payment_status']
    
    def validate_status(self, value):
        valid_statuses = ['pending', 'invoiced', 'completed', 'failed']
        if value not in valid_statuses:
            raise serializers.ValidationError(f"Status inválido. Opciones: {valid_statuses}")
        return value
    
    def validate_payment_status(self, value):
        valid_payment_statuses = ['pending', 'paid', 'failed']
        if value not in valid_payment_statuses:
            raise serializers.ValidationError(f"Payment status inválido. Opciones: {valid_payment_statuses}")
        return value


class OrderPaymentSerializer(serializers.Serializer):
    """
    Serializer para procesar pagos (pay_order)
    """
    payment_method = serializers.ChoiceField(
        choices=['cod'],
        required=True
    )
    
    def validate_payment_method(self, value):
        if value != 'cod':
            raise serializers.ValidationError("Solo se aceptan pagos contra entrega (COD)")
        return value


class OrderDetailSerializer(OrderSerializer):
    """
    Serializer detallado para admin con información adicional
    """
    shipping_info = serializers.SerializerMethodField()
    payment_info = serializers.SerializerMethodField()
    
    class Meta(OrderSerializer.Meta):
        fields = OrderSerializer.Meta.fields + ['shipping_info', 'payment_info']
    
    def get_shipping_info(self, obj):
        return {
            'address': obj.shipping_address,
            'street': obj.street,
            'house_number': obj.house_number,
            'city': obj.city,
            'state': obj.state,
            'country': obj.country,
            'postal_code': obj.postal_code
        }
    
    def get_payment_info(self, obj):
        return {
            'method': obj.payment_method,
            'status': obj.payment_status,
            'stripe_payment_intent': obj.stripe_payment_intent,
            'qb_invoice_id': obj.qb_invoice_id,
            'qb_sales_receipt_id': obj.qb_sales_receipt_id
        }