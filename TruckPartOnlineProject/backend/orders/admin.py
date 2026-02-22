from django.contrib import admin, messages
from .models import Order, OrderItem
from qb.services import create_sales_receipt, create_invoice


# =========================
# ACTION: ENVIAR A QUICKBOOKS
# =========================
def send_to_quickbooks(modeladmin, request, queryset):
    for order in queryset:

        # Evitar doble envío
        if order.qb_sales_receipt_id or order.qb_invoice_id:
            messages.warning(
                request,
                f"Order #{order.id} ya fue enviada a QuickBooks"
            )
            continue

        # Validar que tenga items
        if not order.items.exists():
            messages.error(
                request,
                f"Order #{order.id} no tiene productos"
            )
            continue

        try:
            if order.payment_method == "card":
                qb_id = create_sales_receipt(order)
                order.qb_sales_receipt_id = qb_id
                order.payment_status = "paid"
                order.status = "completed"

            else:  # COD
                qb_id = create_invoice(order)
                order.qb_invoice_id = qb_id
                order.status = "invoiced"

            order.save()

            messages.success(
                request,
                f"Order #{order.id} enviada a QuickBooks (ID {qb_id})"
            )

        except Exception as e:
            messages.error(
                request,
                f"Error en Order #{order.id}: {str(e)}"
            )


send_to_quickbooks.short_description = "📤 Enviar a QuickBooks"


# =========================
# INLINE ORDER ITEMS
# =========================
class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 1


# =========================
# ORDER ADMIN
# =========================
# order/admin.py

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "full_name",
        "guest_email",
        "phone",
        "payment_method",
        "payment_status",
        "status",
        "total",
        "qb_sales_receipt_id",
        "qb_invoice_id",
        "created_at",
    )

    list_filter = (
        "payment_method",
        "payment_status",
        "status",
    )

    search_fields = (
        "id",
        "full_name",
        "guest_email",
        "phone",
        "user__email",
        "user__full_name",
    )

    inlines = [OrderItemInline]
    actions = [send_to_quickbooks]

    readonly_fields = (
        "created_at",
        "qb_sales_receipt_id",
        "qb_invoice_id",
    )

    fieldsets = (
        (None, {
            'fields': ('user',)
        }),
        ('Información del Cliente', {
            'fields': (
                'full_name',
                'guest_email',
                'phone',
            ),
        }),
        ('Datos de Envío', {
            'fields': (
                'shipping_address',
                'street',
                'house_number',
                'state',
                'city',
                'postal_code',
                'country',
            ),
            'classes': ('wide',),  # Opcional: para hacerlo más ancho
            'description': 'Dirección completa de envío'
        }),
        ('Detalles de la orden', {
            'fields': (
                'payment_method',
                'payment_status',
                'status',
                'total'
            )
        }),
        ('QuickBooks', {
            'fields': (
                'qb_sales_receipt_id',
                'qb_invoice_id',
                'created_at'
            ),
            'classes': ('collapse',),  # Opcional: para colapsar la sección
        }),
    )

    class Media:
        js = ('admin/js/autocomplete_order_fields.js',)
#########################################################################################
# =========================
# ORDER ITEM ADMIN
# =========================
@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = (
        "order",
        "product",
        "quantity",
        "price",
    )
