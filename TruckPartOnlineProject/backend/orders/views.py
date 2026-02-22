from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from orders.services import validate_order_stock

from products.models import Product
from .models import Order, OrderItem
from qb.services import (
    #get_qb_item_quantity,
    create_sales_receipt,
    create_invoice
)

"""
1️⃣ GET  /products/              → ver productos + stock QB
2️⃣ POST /checkout/              → crea orden (pending)
3️⃣ POST /orders/{id}/pay/       → crea Invoice o SalesReceipt en QB
4️⃣ GET  /orders/{id}/           → ver detalle
"""

############################LISTAR PRODUCTOS + STOCK QUICKBOOKS################################

@api_view(["GET"])
def products_list(request):
    products = Product.objects.filter(is_active=True)
    data = []

    for p in products:
        data.append({
            "id": p.id,
            "name": p.name,
            "price": float(p.price),
            "brand": p.brand.name if p.brand else None,
            "category": p.category.name if p.category else None,
            #"stock": get_qb_item_quantity(p.qb_item_id)
        })

    return Response(data)


#############################CHECKOUT (CREA ORDEN – NO QUICKBOOKS)############################
@api_view(["POST"])
def checkout(request):
    items = request.data.get("items", [])
    guest_email = request.data.get("guest_email")

    if not items:
        return Response(
            {"error": "No items provided"},
            status=status.HTTP_400_BAD_REQUEST
        )

    # 1️⃣ VALIDAR STOCK CON INVENTARIO LOCAL NO CON QUICKBOOKS
    try:
        validate_order_stock(items)
    except ValueError as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )

    # 2️⃣ CREAR ORDEN
    order = Order.objects.create(
        user=request.user if request.user.is_authenticated else None,
        guest_email=guest_email,
        status="pending"
    )

    total = 0

    for item in items:
        product = get_object_or_404(Product, id=item["product_id"])
        subtotal = product.price * item["quantity"]
        total += subtotal

        OrderItem.objects.create(
            order=order,
            product=product,
            quantity=item["quantity"],
            price=product.price
        )

    order.total = total
    order.save()

    return Response(
        {
            "order_id": order.id,
            "status": order.status,
            "total": float(order.total)
        },
        status=status.HTTP_201_CREATED
    )



#############################PAGAR ORDEN (AQUÍ ENTRA QUICKBOOKS)############################
@api_view(["POST"])
def pay_order(request, order_id):
    """
    {
      "payment_method": "cod" | "card"
    }
    """

    order = get_object_or_404(Order, id=order_id)

    if order.status != "pending":
        return Response(
            {"error": "Order already processed"},
            status=status.HTTP_400_BAD_REQUEST
        )

    payment_method = request.data.get("payment_method")

    if payment_method not in ["cod", "card"]:
        return Response(
            {"error": "Invalid payment method"},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        # 🧾 Pago contra entrega → INVOICE
        if payment_method == "cod":
            invoice_id = create_invoice(order)
            order.qb_sales_id = invoice_id
            order.status = "invoiced"

        # 💳 Tarjeta → SALES RECEIPT
        elif payment_method == "card":
            receipt_id = create_sales_receipt(order)
            order.qb_sales_id = receipt_id
            order.status = "completed"

        order.save()

        return Response({
            "order_id": order.id,
            "status": order.status,
            "qb_sales_id": order.qb_sales_id
        })

    except Exception as e:
        order.status = "failed"
        order.save()
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


#############################DETALLE DE ORDEN############################
@api_view(["GET"])
def order_detail(request, order_id):
    order = get_object_or_404(Order, id=order_id)

    items = []
    for i in order.items.all():
        items.append({
            "product": i.product.name,
            "quantity": i.quantity,
            "price": float(i.price)
        })

    return Response({
        "id": order.id,
        "status": order.status,
        "total": float(order.total),
        "qb_sales_id": order.qb_sales_id,
        "items": items,
        "created_at": order.created_at
    })


#############################LISTAR ORDENES DEL USUARIO############################
@api_view(["GET"])
def my_orders(request):
    """
    GET /orders/my-orders/
    Lista todas las órdenes del usuario autenticado
    """
    if not request.user.is_authenticated:
        return Response(
            {"error": "Authentication required"},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    orders = Order.objects.filter(user=request.user).order_by('-created_at')
    
    data = []
    for order in orders:
        items = []
        for i in order.items.all():
            items.append({
                "id": i.id,
                "product": {
                    "id": i.product.id,
                    "name": i.product.name,
                    "sku": i.product.sku,
                    "images": [{"id": img.id, "image": img.image.url, "is_main": img.is_main} 
                              for img in i.product.images.all()]
                },
                "quantity": i.quantity,
                "price": float(i.price)
            })
        
        data.append({
            "id": order.id,
            "status": order.status,
            "payment_method": order.payment_method,
            "payment_status": order.payment_status,
            "total": float(order.total),
            "shipping_address": order.shipping_address,
            "city": order.city,
            "state": order.state,
            "country": order.country,
            "postal_code": order.postal_code,
            "created_at": order.created_at,
            "items": items
        })
    
    return Response({
        "count": len(data),
        "results": data
    })
####################################################################################


