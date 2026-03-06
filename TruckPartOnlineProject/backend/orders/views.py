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
    except Product.DoesNotExist:
         return Response(
            {"error": "Uno o más productos no existen"},
            status=status.HTTP_400_BAD_REQUEST
        )
    except KeyError:
        return Response(
            {"error": "Faltan datos en los items (product_id o quantity)"},
            status=status.HTTP_400_BAD_REQUEST
        )

    # 2️⃣ CREAR ORDEN
    try:
        order = Order.objects.create(
            user=request.user if request.user.is_authenticated else None,
            full_name=request.data.get("full_name"),
            guest_email=guest_email,
            phone=request.data.get("phone"),
            shipping_address=request.data.get("shipping_address"),
            city=request.data.get("city"),
            state=request.data.get("state"),
            country=request.data.get("country"),
            postal_code=request.data.get("postal_code"),
            status="pending"
        )

        total = 0

        for item in items:
            product = Product.objects.get(id=item["product_id"]) # validate_order_stock already checked existence mostly, but good to be safe
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
    except KeyError as e:
        return Response(
            {"error": f"Falta el campo {str(e)} en los items"},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Product.DoesNotExist:
        return Response(
            {"error": "Producto no encontrado durante la creación de la orden"},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        return Response(
            {"error": f"Error al procesar la orden: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
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


#############################ADMIN: LISTAR TODAS LAS ÓRDENES############################
@api_view(["GET"])
def admin_orders_list(request):
    """
    GET /api/admin/orders/
    Lista todas las órdenes del sistema (solo staff)
    """
    if not request.user.is_authenticated or not request.user.is_staff:
        return Response(
            {"error": "Admin access required"},
            status=status.HTTP_403_FORBIDDEN
        )

    # Soporte de filtros
    status_filter = request.query_params.get("status")
    payment_status_filter = request.query_params.get("payment_status")
    search = request.query_params.get("search")  # buscar por id, nombre del cliente o email

    orders = Order.objects.all().order_by('-created_at')

    if status_filter:
        orders = orders.filter(status=status_filter)
    if payment_status_filter:
        orders = orders.filter(payment_status=payment_status_filter)
    if search:
        from django.db.models import Q
        orders = orders.filter(
            Q(id__icontains=search) |
            Q(full_name__icontains=search) |
            Q(guest_email__icontains=search) |
            Q(user__email__icontains=search)
        )

    # Paginación
    page = int(request.query_params.get("page", 1))
    page_size = int(request.query_params.get("page_size", 20))
    total = orders.count()
    start = (page - 1) * page_size
    end = start + page_size
    orders = orders[start:end]

    data = []
    for order in orders:
        items_count = order.items.count()
        data.append({
            "id": order.id,
            "full_name": order.full_name,
            "guest_email": order.guest_email,
            "user_email": order.user.email if order.user else None,
            "status": order.status,
            "payment_method": order.payment_method,
            "payment_status": order.payment_status,
            "total": float(order.total),
            "items_count": items_count,
            "created_at": order.created_at,
            "shipping_address": order.shipping_address,
            "city": order.city,
            "state": order.state,
        })

    return Response({
        "count": total,
        "page": page,
        "page_size": page_size,
        "results": data
    })


#############################ADMIN: DETALLE DE UNA ORDEN############################
@api_view(["GET"])
def admin_order_detail(request, order_id):
    """
    GET /api/admin/orders/{order_id}/
    Detalle completo de una orden (solo staff)
    """
    if not request.user.is_authenticated or not request.user.is_staff:
        return Response(
            {"error": "Admin access required"},
            status=status.HTTP_403_FORBIDDEN
        )

    order = get_object_or_404(Order, id=order_id)

    items = []
    for i in order.items.all():
        product_images = [{"id": img.id, "image": img.image.url, "is_main": img.is_main}
                         for img in i.product.images.all()]
        items.append({
            "id": i.id,
            "product": {
                "id": i.product.id,
                "name": i.product.name,
                "sku": i.product.sku,
                "images": product_images,
            },
            "quantity": i.quantity,
            "price": float(i.price)
        })

    return Response({
        "id": order.id,
        "full_name": order.full_name,
        "guest_email": order.guest_email,
        "phone": order.phone,
        "user": {
            "id": order.user.id,
            "email": order.user.email,
            "username": order.user.username,
        } if order.user else None,
        "shipping_address": order.shipping_address,
        "city": order.city,
        "state": order.state,
        "country": order.country,
        "postal_code": order.postal_code,
        "status": order.status,
        "payment_method": order.payment_method,
        "payment_status": order.payment_status,
        "total": float(order.total),
        "qb_invoice_id": order.qb_invoice_id,
        "qb_sales_receipt_id": order.qb_sales_receipt_id,
        "items": items,
        "created_at": order.created_at,
    })


#############################ADMIN: ACTUALIZAR STATUS DE UNA ORDEN############################
@api_view(["PATCH"])
def admin_update_order_status(request, order_id):
    """
    PATCH /api/admin/orders/{order_id}/status/
    Actualizar status de una orden (solo staff)
    """
    if not request.user.is_authenticated or not request.user.is_staff:
        return Response(
            {"error": "Admin access required"},
            status=status.HTTP_403_FORBIDDEN
        )

    order = get_object_or_404(Order, id=order_id)

    new_status = request.data.get("status")
    new_payment_status = request.data.get("payment_status")

    valid_statuses = ["pending", "invoiced", "completed", "failed"]
    valid_payment_statuses = ["pending", "paid", "failed"]

    if new_status:
        if new_status not in valid_statuses:
            return Response(
                {"error": f"Invalid status. Valid: {valid_statuses}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        order.status = new_status

    if new_payment_status:
        if new_payment_status not in valid_payment_statuses:
            return Response(
                {"error": f"Invalid payment status. Valid: {valid_payment_statuses}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        order.payment_status = new_payment_status

    order.save()

    return Response({
        "id": order.id,
        "status": order.status,
        "payment_status": order.payment_status,
        "message": "Order updated successfully"
    })
