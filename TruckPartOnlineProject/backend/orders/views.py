# orders/views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import stripe
from django.conf import settings

from .models import Order, OrderItem
from .serializers import (
    OrderCreateSerializer,
    OrderSerializer,
    OrderUpdateSerializer,
    OrderPaymentSerializer,
    OrderDetailSerializer
)
from .services import validate_order_stock
from inventory.services.inventory import move_inventory
from products.models import Product
from qb.services import create_sales_receipt, create_invoice

stripe.api_key = settings.STRIPE_SECRET_KEY


@api_view(["POST"])
@permission_classes([AllowAny])
def checkout(request):
    """
    Crear una nueva orden (checkout).
    Soporta usuarios autenticados e invitados.
    """
    serializer = OrderCreateSerializer(
        data=request.data,
        context={'request': request}
    )

    if not serializer.is_valid():
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    data = serializer.validated_data

    try:
        with transaction.atomic():
            items = data["items"]
            payment_method = data["payment_method"]

            # 1️⃣ Validar stock
            try:
                validate_order_stock(items)
            except ValueError as e:
                return Response(
                    {"error": str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # 2️⃣ Crear la orden
            order = Order.objects.create(
                user=request.user if request.user.is_authenticated else None,
                full_name=data["full_name"],
                guest_email=data.get("guest_email"),
                phone=data.get("phone", ""),
                shipping_address=data.get("shipping_address", ""),
                street=data.get("street", ""),
                house_number=data.get("house_number", ""),
                city=data.get("city", ""),
                state=data.get("state", ""),
                country=data.get("country", ""),
                postal_code=data.get("postal_code", ""),
                status="pending",
                payment_method=payment_method
            )

            # 3️⃣ Crear items y calcular total
            total = 0
            for item in items:
                product = Product.objects.get(id=item["product_id"])
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

            # 4️⃣ Si es tarjeta, crear PaymentIntent en Stripe
            if payment_method == "card":
                intent = stripe.PaymentIntent.create(
                    amount=int(total * 100),
                    currency="usd",
                    metadata={"order_id": order.id},
                    automatic_payment_methods={"enabled": True},
                )
                order.stripe_payment_intent = intent.id
                order.stripe_client_secret = intent.client_secret
                order.save()

                return Response({
                    "order_id": order.id,
                    "client_secret": intent.client_secret,
                    "status": "requires_payment",
                    "total": float(order.total)
                }, status=status.HTTP_201_CREATED)

            # 5️⃣ Si es COD, respuesta simple
            return Response(
                {
                    "order_id": order.id,
                    "status": order.status,
                    "total": float(order.total)
                },
                status=status.HTTP_201_CREATED
            )
    except stripe.StripeError as e:
        # stripe.error.StripeError fue eliminado en stripe>=13.0 → usar stripe.StripeError
        return Response(
            {"error": f"Error al procesar el pago con tarjeta: {str(e)}"},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(["GET"])
def order_detail(request, order_id):
    """
    Obtener detalle de una orden específica
    """
    order = get_object_or_404(Order, id=order_id)
    
    # Validar permisos
    if order.user and order.user != request.user:
        if not request.user.is_staff:
            return Response(
                {"error": "No tienes permiso para ver esta orden"},
                status=status.HTTP_403_FORBIDDEN
            )
    
    # Usar serializer según permisos
    if request.user.is_staff:
        serializer = OrderDetailSerializer(order)
    else:
        serializer = OrderSerializer(order)
    
    return Response(serializer.data)


@api_view(["GET"])
def my_orders(request):
    """
    Listar órdenes del usuario autenticado
    """
    if not request.user.is_authenticated:
        return Response(
            {"error": "Authentication required"},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    orders = Order.objects.filter(user=request.user).order_by('-created_at')
    serializer = OrderSerializer(orders, many=True)
    
    return Response({
        "count": len(serializer.data),
        "results": serializer.data
    })


@api_view(["GET"])
def admin_orders_list(request):
    """
    Listar todas las órdenes (solo admin)
    """
    if not request.user.is_authenticated or not request.user.is_staff:
        return Response(
            {"error": "Admin access required"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    orders = Order.objects.all().order_by('-created_at')
    
    # Filtros
    status_filter = request.query_params.get("status")
    payment_status_filter = request.query_params.get("payment_status")
    
    if status_filter:
        orders = orders.filter(status=status_filter)
    if payment_status_filter:
        orders = orders.filter(payment_status=payment_status_filter)
    
    # Paginación simple
    page = int(request.query_params.get("page", 1))
    page_size = int(request.query_params.get("page_size", 20))
    total = orders.count()
    start = (page - 1) * page_size
    end = start + page_size
    orders = orders[start:end]
    
    serializer = OrderSerializer(orders, many=True)
    
    return Response({
        "count": total,
        "page": page,
        "page_size": page_size,
        "results": serializer.data
    })


@api_view(["GET"])
def admin_order_detail(request, order_id):
    """
    Detalle completo de una orden para admin
    """
    if not request.user.is_authenticated or not request.user.is_staff:
        return Response(
            {"error": "Admin access required"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    order = get_object_or_404(Order, id=order_id)
    serializer = OrderDetailSerializer(order)
    
    return Response(serializer.data)


@api_view(["PATCH"])
def admin_update_order_status(request, order_id):
    """
    Actualizar estado de una orden (admin)
    """
    if not request.user.is_authenticated or not request.user.is_staff:
        return Response(
            {"error": "Admin access required"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    order = get_object_or_404(Order, id=order_id)
    serializer = OrderUpdateSerializer(order, data=request.data, partial=True)
    
    if serializer.is_valid():
        serializer.save()
        return Response({
            "id": order.id,
            "status": order.status,
            "payment_status": order.payment_status,
            "message": "Orden actualizada exitosamente"
        })
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


################# Endpoint para procesar pago de orden COD (descontar stock y crear invoice en QuickBooks)###################

@api_view(["POST"])
@permission_classes([AllowAny])
def pay_order(request, order_id):
    """
    Procesar pago de orden COD
    """
    order = get_object_or_404(Order, id=order_id)
    
    # Validar estado
    if order.status != "pending":
        return Response(
            {"error": "La orden ya fue procesada"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Validar método de pago
    if order.payment_method != "cod":
        return Response(
            {"error": "Esta orden no es contra entrega (COD)"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    serializer = OrderPaymentSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        with transaction.atomic():
            # 1. Descontar stock
            for item in order.items.all():
                move_inventory(
                    product=item.product,
                    quantity_change=-item.quantity,
                    reason="Venta COD",
                    reference=f"Orden #{order.id}"
                )
            
            # 2. Crear invoice en QuickBooks
            invoice_id = create_invoice(order)
            
            # 3. Actualizar orden
            order.qb_invoice_id = invoice_id
            order.status = "invoiced"
            order.payment_status = "pending"
            order.save()
            
            return Response({
                "order_id": order.id,
                "status": order.status,
                "qb_invoice_id": order.qb_invoice_id,
            })
            
    except Exception as e:
        return Response({"error": str(e)}, status=500)

#################### Endpoint para listar productos disponibles (para el frontend)###########################################

@api_view(["GET"])
def products_list(request):
    """
    Listar productos disponibles
    """
    from products.models import Product
    products = Product.objects.filter(is_active=True)
    
    data = []
    for p in products:
        data.append({
            "id": p.id,
            "name": p.name,
            "price": float(p.price),
            "brand": p.brand.name if p.brand else None,
            "category": p.category.name if p.category else None,
            "stock": getattr(p.inventory, 'quantity', 0) if hasattr(p, 'inventory') else 0
        })
    
    return Response(data)

###############################webhook de striper#################################################################
""" 
@csrf_exempt
def stripe_webhook(request):
    
    #Webhook de Stripe para procesar eventos de pago
    
    payload = request.body
    sig_header = request.META.get("HTTP_STRIPE_SIGNATURE")
    
    try:
        event = stripe.Webhook.construct_event(
            payload,
            sig_header,
            settings.STRIPE_WEBHOOK_SECRET
        )
    except Exception:
        return JsonResponse({"error": "Invalid webhook"}, status=400)
    
    if event["type"] == "payment_intent.succeeded":
        intent = event["data"]["object"]
        order_id = intent["metadata"]["order_id"]
        
        try:
            with transaction.atomic():
                order = Order.objects.get(id=order_id)
                
                # Verificar idempotencia
                if order.payment_status == "paid":
                    return JsonResponse({"status": "already_processed"})
                
                # Validar monto
                if int(order.total * 100) != intent["amount"]:
                    return JsonResponse({"error": "Amount mismatch"}, status=400)
                
                # Descontar stock
                for item in order.items.all():
                    move_inventory(
                        product=item.product,
                        quantity_change=-item.quantity,
                        reason="Venta",
                        reference=f"Orden #{order.id} - Pago Stripe"
                    )
                
                # Crear sales receipt en QuickBooks
                receipt_id = create_sales_receipt(order)
                
                # Actualizar orden
                order.qb_sales_receipt_id = receipt_id
                order.status = "completed"
                order.payment_status = "paid"
                order.save()
                
        except Order.DoesNotExist:
            pass
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    
    elif event["type"] == "payment_intent.payment_failed":
        intent = event["data"]["object"]
        order_id = intent["metadata"]["order_id"]
        
        try:
            order = Order.objects.get(id=order_id)
            order.status = "failed"
            order.payment_status = "failed"
            order.save()
        except Order.DoesNotExist:
            pass
    
    return JsonResponse({"status": "ok"})
"""



@csrf_exempt
def stripe_webhook(request):
    payload = request.body
    sig_header = request.META.get("HTTP_STRIPE_SIGNATURE")

    # 🔐 1. Verificar firma (CRÍTICO)
    try:
        event = stripe.Webhook.construct_event(
            payload,
            sig_header,
            settings.STRIPE_WEBHOOK_SECRET
        )
    except stripe.error.SignatureVerificationError as e:
        print("❌ Firma inválida:", e)
        return JsonResponse({"error": "Invalid signature"}, status=400)
    except Exception as e:
        print("❌ Error webhook:", e)
        return JsonResponse({"error": "Invalid payload"}, status=400)

    event_id = event.get("id")
    event_type = event.get("type")

    print(f"📩 Evento recibido: {event_type} ({event_id})")

    # 🔁 2. IDEMPOTENCIA (EVITA PROCESAR 2 VECES)
    """
    OPCIONAL PERO PRO:
    if StripeEvent.objects.filter(event_id=event_id).exists():
        print("⚠️ Evento ya procesado")
        return JsonResponse({"status": "already_processed"})

    StripeEvent.objects.create(event_id=event_id)
    """

    try:
        # 🎯 3. MANEJO DE EVENTOS

        if event_type == "payment_intent.succeeded":
            intent = event["data"]["object"]

            metadata = intent.get("metadata", {})
            order_id = metadata.get("order_id")

            if not order_id:
                print("⚠️ Sin order_id (evento ignorado)")
                return JsonResponse({"status": "ignored"})

            with transaction.atomic():
                try:
                    order = Order.objects.select_for_update().get(id=order_id)
                except Order.DoesNotExist:
                    print("⚠️ Orden no encontrada")
                    return JsonResponse({"status": "ignored"})

                # 🔁 Idempotencia por estado
                if order.payment_status == "paid":
                    print("⚠️ Orden ya pagada")
                    return JsonResponse({"status": "already_processed"})

                # 💰 Validar monto
                stripe_amount = intent.get("amount")
                expected_amount = int(order.total * 100)

                if stripe_amount != expected_amount:
                    print("❌ Monto no coincide")
                    return JsonResponse({"status": "amount_mismatch"})

                # 💱 Validar moneda
                if intent.get("currency") != "usd":
                    print("❌ Moneda incorrecta")
                    return JsonResponse({"status": "currency_error"})

                # 📦 Descontar inventario
                for item in order.items.all():
                    move_inventory(
                        product=item.product,
                        quantity_change=-item.quantity,
                        reason="Venta",
                        reference=f"Orden #{order.id} - Stripe"
                    )

                # 🧾 Integración externa (QuickBooks)
                try:
                    receipt_id = create_sales_receipt(order)
                except Exception as e:
                    print("⚠️ Error QuickBooks:", e)
                    receipt_id = None

                # 🧾 Actualizar orden
                order.qb_sales_receipt_id = receipt_id
                order.status = "completed"
                order.payment_status = "paid"
                order.stripe_payment_intent = intent.get("id")
                order.save()

                print("✅ Orden completada correctamente")

        # ❌ Pago fallido
        elif event_type == "payment_intent.payment_failed":
            intent = event["data"]["object"]

            metadata = intent.get("metadata", {})
            order_id = metadata.get("order_id")

            if not order_id:
                return JsonResponse({"status": "ignored"})

            try:
                order = Order.objects.get(id=order_id)
                order.status = "failed"
                order.payment_status = "failed"
                order.save()
                print("❌ Orden marcada como fallida")
            except Order.DoesNotExist:
                pass

        # 💸 Reembolsos (extra PRO)
        elif event_type == "charge.refunded":
            charge = event["data"]["object"]

            payment_intent_id = charge.get("payment_intent")

            try:
                order = Order.objects.get(
                    stripe_payment_intent=payment_intent_id
                )
                order.status = "refunded"
                order.payment_status = "refunded"
                order.save()

                print("💸 Orden reembolsada")
            except Order.DoesNotExist:
                pass

        else:
            print(f"ℹ️ Evento no manejado: {event_type}")

    except Exception as e:
        print("🔥 Error crítico:", str(e))
        return JsonResponse({"error": "Server error"}, status=500)

    # ✅ SIEMPRE responder 200 para evitar reintentos innecesarios
    return JsonResponse({"status": "ok"})