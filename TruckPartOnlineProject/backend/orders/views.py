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
from .models import StripeEvent
from django.core.exceptions import ValidationError
from inventory.models import InventoryMovement

stripe.api_key = settings.STRIPE_SECRET_KEY

from decimal import Decimal, ROUND_HALF_UP

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
            subtotal = Decimal('0.00')
            tax_total = Decimal('0.00')
            tax_rate = Decimal('0.07')

            for item in items:
                product = Product.objects.get(id=item["product_id"])

                item_subtotal = (product.price * item["quantity"]).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
                item_tax = (item_subtotal * tax_rate).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

                subtotal += item_subtotal
                tax_total += item_tax

                OrderItem.objects.create(
                    order=order,
                    product=product,
                    quantity=item["quantity"],
                    price=product.price
                )
            order.subtotal = subtotal.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
            order.tax = tax_total
            order.save()


            # 4️⃣ Si es tarjeta, crear PaymentIntent en Stripe
            if payment_method == "card":
                intent = stripe.PaymentIntent.create(
                    amount = int(order.total * 100),
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
                    "subtotal": float(order.subtotal),
                    "tax": float(order.tax),
                    "total": float(order.total)
                }, status=status.HTTP_201_CREATED)

            # 5️⃣ Si es COD, respuesta simple
            return Response(
                {
                    "order_id": order.id,
                    "status": order.status,
                    "subtotal": float(order.subtotal),
                    "tax": float(order.tax),
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


@csrf_exempt
def stripe_webhook(request):
    payload = request.body
    sig_header = request.META.get("HTTP_STRIPE_SIGNATURE")

    # 🔐 1. Verificar firma
    try:
        event = stripe.Webhook.construct_event(
            payload,
            sig_header,
            settings.STRIPE_WEBHOOK_SECRET
        )
    except stripe.error.SignatureVerificationError as e:
        return JsonResponse({"error": "Invalid signature"}, status=400)
    except Exception as e:
        return JsonResponse({"error": "Invalid payload"}, status=400)

    event_id = event.get("id")
    event_type = event.get("type")

    # 🔁 IDEMPOTENCIA con modelo actual
    
    # Verificar si ya procesamos este evento
    if StripeEvent.objects.filter(event_id=event_id).exists():
        return JsonResponse({"status": "already_processed"})

    try:
        if event_type == "payment_intent.succeeded":
            intent = event["data"]["object"]
            metadata = intent.get("metadata", {})
            order_id = metadata.get("order_id")

            if not order_id:
                # Registrar evento ignorado
                StripeEvent.objects.create(event_id=event_id)
                return JsonResponse({"status": "ignored"})

            with transaction.atomic():
                try:
                    order = Order.objects.select_for_update().get(id=order_id)
                   
                except Order.DoesNotExist:
                    StripeEvent.objects.create(event_id=event_id)
                    return JsonResponse({"status": "ignored"})

                # 🔴 VALIDACIÓN 1: Solo tarjeta
                if order.payment_method != "card":
                    StripeEvent.objects.create(event_id=event_id)
                    return JsonResponse({"status": "ignored", "reason": "not_card_payment"})

                # 🔴 VALIDACIÓN 2: No procesar si ya está pagada
                if order.payment_status == "paid":
                    StripeEvent.objects.create(event_id=event_id)
                    return JsonResponse({"status": "already_processed"})

                # 🔴 VALIDACIÓN 3: Verificar si ya tiene inventario descontado
                existing_movements = InventoryMovement.objects.filter(
                    reference__icontains=f"Orden #{order.id}"
                )
                
                if existing_movements.exists():
                    print(f"\n   ⚠️ ⚠️ ⚠️ ALERTA CRÍTICA ⚠️ ⚠️ ⚠️")
                    print(f"   YA EXISTEN MOVIMIENTOS DE INVENTARIO PARA ESTA ORDEN!")
                    print(f"   Cantidad de movimientos: {existing_movements.count()}")
                    for mov in existing_movements:
                        print(f"      - {mov.created_at}: {mov.change} ({mov.reason})")
                    print(f"\n   Saltando descuento de inventario para evitar doble descuento")
                    print(f"   Actualizando estado de la orden...")
                    
                    # Solo actualizar estado si es necesario
                    if order.status != "completed":
                        order.status = "completed"
                        order.payment_status = "paid"
                        order.stripe_payment_intent = intent.get("id")
                        order.save()
                        print(f"   ✅ Orden #{order.id} actualizada a completed")
                    
                    StripeEvent.objects.create(event_id=event_id)
                    return JsonResponse({"status": "inventory_already_deducted"})

                # 💰 Validar monto
                stripe_amount = intent.get("amount")
                expected_amount = int(order.total * 100)

                if stripe_amount != expected_amount:
                    return JsonResponse({"status": "amount_mismatch"}, status=400)

                # 💱 Validar moneda
                if intent.get("currency") != "usd":
                    print(f"   ❌ Moneda incorrecta: {intent.get('currency')}")
                    return JsonResponse({"status": "currency_error"}, status=400)

                # 📋 Obtener items de la orden
                items_list = list(order.items.all())
                print(f"\n📋 ITEMS DE LA ORDEN:")
                print(f"   Total items en orden: {len(items_list)}")
                for idx, item in enumerate(items_list, 1):
                    print(f"\n   Item {idx}:")
                    print(f"      - ID: {item.id}")
                    print(f"      - Producto: {item.product.name}")
                    print(f"      - Product ID: {item.product.id}")
                    print(f"      - Cantidad: {item.quantity}")
                    print(f"      - Precio: ${item.price}")

                # 📦 DESCONTAR INVENTARIO
                print(f"\n🔻 INICIANDO DESCUENTO DE INVENTARIO:")
                print(f"{'='*80}")
                
                for idx, item in enumerate(items_list, 1):
                    print(f"\n--- Procesando Item {idx}/{len(items_list)} ---")
                    print(f"   Producto: {item.product.name}")
                    print(f"   Cantidad a descontar: {item.quantity}")
                    
                    # Verificar stock actual antes de descontar
                    from inventory.models import Inventory
                    inventory = Inventory.objects.select_for_update().get(product=item.product)
                    stock_before = inventory.quantity
                    print(f"   Stock ANTES: {stock_before}")
                    
                    if stock_before < item.quantity:
                        print(f"   ❌ ERROR: Stock insuficiente!")
                        print(f"      - Disponible: {stock_before}")
                        print(f"      - Solicitado: {item.quantity}")
                        raise ValidationError(f"Stock insuficiente para {item.product.name}")
                    
                    # Descontar
                    try:
                        
                        new_quantity = move_inventory(
                            product=item.product,
                            quantity_change=-item.quantity,
                            reason="Venta Stripe",
                            reference=f"Orden #{order.id} - PaymentIntent {intent.get('id')}"
                        )
                        print(f"   Stock DESPUÉS: {new_quantity}")
                        print(f"   ✅ Descontado: {stock_before - new_quantity} unidades")
                        
                        # Verificar que se descontó la cantidad correcta
                        if (stock_before - new_quantity) != item.quantity:
                            print(f"   ⚠️ ADVERTENCIA: Se descontaron {stock_before - new_quantity} pero deberían ser {item.quantity}")
                            
                    except Exception as e:
                        print(f"   ❌ Error al descontar: {e}")
                        raise

                print(f"\n{'='*80}")
                print(f"✅ INVENTARIO DESCONTADO CORRECTAMENTE")
                print(f"{'='*80}")

                # 🧾 Integración con QuickBooks
                print(f"\n📊 INTEGRACIÓN CON QUICKBOOKS:")
                try:
                    receipt_id = create_sales_receipt(order)
                    print(f"   ✅ Sales Receipt creado: {receipt_id}")
                except Exception as e:
                    print(f"   ⚠️ Error en QuickBooks: {e}")
                    receipt_id = None
                    # Si QuickBooks es crítico, descomenta la siguiente línea:
                    # raise e

                # 🧾 Actualizar orden
                print(f"\n💾 ACTUALIZANDO ORDEN EN BASE DE DATOS:")
                order.qb_sales_receipt_id = receipt_id
                order.status = "completed"
                order.payment_status = "paid"
                order.stripe_payment_intent = intent.get("id")
                order.save()
                print(f"   - status: {order.status}")
                print(f"   - payment_status: {order.payment_status}")
                print(f"   - stripe_payment_intent: {order.stripe_payment_intent}")
                print(f"   - qb_sales_receipt_id: {order.qb_sales_receipt_id}")

                # Registrar evento procesado
                StripeEvent.objects.create(event_id=event_id)
                
                print(f"\n{'='*80}")
                print(f"🎉 ORDEN #{order.id} COMPLETADA EXITOSAMENTE")
                print(f"{'='*80}")
                print(f"   Estado final: {order.status}")
                print(f"   Payment status: {order.payment_status}")
                print(f"   Total: ${order.total}")
                print(f"   Items procesados: {len(items_list)}")
                print(f"{'='*80}\n")

        elif event_type == "payment_intent.payment_failed":
            intent = event["data"]["object"]
            metadata = intent.get("metadata", {})
            order_id = metadata.get("order_id")
            
            print(f"\n{'='*80}")
            print(f"❌ PAGO FALLIDO")
            print(f"{'='*80}")
            print(f"   Order ID: {order_id}")
            print(f"   Error: {intent.get('last_payment_error', {}).get('message', 'Unknown error')}")
            print(f"{'='*80}")

            if not order_id:
                print("⚠️ Sin order_id, evento ignorado")
                StripeEvent.objects.create(event_id=event_id)
                return JsonResponse({"status": "ignored"})

            try:
                with transaction.atomic():
                    order = Order.objects.select_for_update().get(id=order_id)
                    print(f"📦 Orden #{order.id} encontrada")
                    print(f"   Estado actual: {order.status}")
                    print(f"   Payment status: {order.payment_status}")
                    
                    if order.payment_status != "paid":
                        order.status = "failed"
                        order.payment_status = "failed"
                        order.save()
                        print(f"   ✅ Orden marcada como fallida")
                    else:
                        print(f"   ⚠️ Orden ya estaba pagada, no se modifica")
                    
                    StripeEvent.objects.create(event_id=event_id)
            except Order.DoesNotExist:
                print(f"❌ Orden #{order_id} no encontrada")
                StripeEvent.objects.create(event_id=event_id)

        elif event_type == "charge.refunded":
            charge = event["data"]["object"]
            payment_intent_id = charge.get("payment_intent")
            
            print(f"\n{'='*80}")
            print(f"💸 REEMBOLSO PROCESADO")
            print(f"{'='*80}")
            print(f"   Payment Intent ID: {payment_intent_id}")
            print(f"   Amount refunded: {charge.get('amount_refunded', 0) / 100}")
            print(f"{'='*80}")

            try:
                with transaction.atomic():
                    order = Order.objects.select_for_update().get(
                        stripe_payment_intent=payment_intent_id
                    )
                    print(f"📦 Orden #{order.id} encontrada")
                    print(f"   Estado actual: {order.status}")
                    print(f"   Payment status: {order.payment_status}")
                    
                    if order.payment_status != "refunded":
                        # Reponer inventario
                        print(f"\n🔄 REPONIENDO INVENTARIO:")
                        for item in order.items.all():
                            print(f"   - {item.product.name}: +{item.quantity}")
                            
                            move_inventory(
                                product=item.product,
                                quantity_change=item.quantity,
                                reason="Reembolso Stripe",
                                reference=f"Orden #{order.id} - Refund"
                            )
                        
                        order.status = "refunded"
                        order.payment_status = "refunded"
                        order.save()
                        print(f"\n✅ Orden #{order.id} marcada como reembolsada")
                    else:
                        print(f"⚠️ Orden ya estaba reembolsada")
                    
                    StripeEvent.objects.create(event_id=event_id)
            except Order.DoesNotExist:
                print(f"❌ Orden con payment_intent {payment_intent_id} no encontrada")
                StripeEvent.objects.create(event_id=event_id)

        else:
            print(f"\n{'='*80}")
            print(f"ℹ️ EVENTO NO MANEJADO: {event_type}")
            print(f"{'='*80}")
            StripeEvent.objects.create(event_id=event_id)

    except Exception as e:
        print(f"\n{'='*80}")
        print(f"🔥 ERROR CRÍTICO EN WEBHOOK")
        print(f"{'='*80}")
        print(f"   Error: {str(e)}")
        print(f"   Event ID: {event_id}")
        print(f"   Event Type: {event_type}")
        print(f"{'='*80}\n")
        import traceback
        traceback.print_exc()
        return JsonResponse({"error": "Server error"}, status=500)

    print(f"✅ Webhook procesado exitosamente: {event_id}")
    return JsonResponse({"status": "ok"})