from django.shortcuts import render
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

# Create your views here.
from rest_framework.viewsets import ReadOnlyModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status

from .models import Inventory
from .serializers import (
    InventorySerializer,
    InventoryMovementSerializer,
)
from .services.inventory import move_inventory

class InventoryViewSet(ReadOnlyModelViewSet):
    """
    API para la gestión integral del inventario de productos.
    
    Este endpoint proporciona acceso a las operaciones CRUD para el inventario,
    permitiendo el seguimiento de existencias, movimientos y disponibilidad
    de productos en tiempo real.
    
    ## Permisos
    - `list`: Cualquier usuario autenticado puede ver el inventario
    - `retrieve`: Cualquier usuario autenticado puede ver el detalle de un ítem
    - `movements`: Requiere permiso 'inventory.view_inventorymovement' para ver movimientos
    - `adjust`: Requiere permiso 'inventory.change_inventory' para realizar ajustes
    
    ## Filtros disponibles
    - `product_id`: Filtrar inventario por ID de producto
    - `location`: Filtrar por ubicación (almacén, tienda, etc.)
    - `min_quantity`: Muestra solo productos con cantidad mayor o igual
    - `max_quantity`: Muestra solo productos con cantidad menor o igual
    - `in_stock`: `true` para ver solo productos con stock, `false` para agotados
    
    ## Ordenamiento
    Los resultados se pueden ordenar mediante el parámetro `ordering`:
    - `product`: Ordenar por nombre de producto
    - `quantity`: Ordenar por cantidad disponible
    - `-product`, `-quantity`: Orden descendente
    """
    swagger_tags = ['Inventario']
    queryset = Inventory.objects.select_related("product")
    serializer_class = InventorySerializer
    # permission_classes = [IsAuthenticated]
    
    # Configuración de filtros
    filterset_fields = {
        'product': ['exact'],
        'location': ['exact', 'in'],
        'quantity': ['gte', 'lte', 'gt', 'lt', 'exact'],
        'updated_at': ['date', 'date__gte', 'date__lte', 'gt', 'lt'],
    }
    search_fields = ['product__name', 'product__sku', 'product__barcode']
    ordering_fields = ['product__name', 'quantity', 'updated_at']
    ordering = ['product__name']
    
    @swagger_auto_schema(
        operation_id='inventory_list',
        operation_description="""
        Obtiene una lista paginada de todos los ítems de inventario.
        
        Este endpoint permite filtrar, buscar y ordenar los resultados.
        Por defecto, devuelve 20 resultados por página.
        """,
        manual_parameters=[
            openapi.Parameter(
                'product_id', 
                openapi.IN_QUERY, 
                description='Filtrar por ID de producto', 
                type=openapi.TYPE_INTEGER
            ),
            openapi.Parameter(
                'location', 
                openapi.IN_QUERY, 
                description='Filtrar por ubicación', 
                type=openapi.TYPE_STRING
            ),
            openapi.Parameter(
                'min_quantity', 
                openapi.IN_QUERY, 
                description='Cantidad mínima en inventario', 
                type=openapi.TYPE_INTEGER
            ),
            openapi.Parameter(
                'max_quantity', 
                openapi.IN_QUERY, 
                description='Cantidad máxima en inventario', 
                type=openapi.TYPE_INTEGER
            ),
            openapi.Parameter(
                'in_stock', 
                openapi.IN_QUERY, 
                description='Filtrar por disponibilidad', 
                type=openapi.TYPE_BOOLEAN
            ),
            openapi.Parameter(
                'search', 
                openapi.IN_QUERY, 
                description='Búsqueda por nombre, SKU o código de barras', 
                type=openapi.TYPE_STRING
            ),
            openapi.Parameter(
                'ordering', 
                openapi.IN_QUERY, 
                description='Campo por el cual ordenar', 
                type=openapi.TYPE_STRING,
                enum=['product', 'quantity', 'updated_at', '-product', '-quantity', '-updated_at']
            ),
        ],
        responses={
            200: openapi.Response(
                description='Lista de ítems de inventario',
                schema=InventorySerializer(many=True),
                examples={
                    'application/json': {
                        'count': 42,
                        'next': 'http://api.example.com/inventory/?page=2',
                        'previous': None,
                        'results': [
                            {
                                'id': 1,
                                'product': {
                                    'id': 101,
                                    'name': 'Filtro de aceite',
                                    'sku': 'FIL-001',
                                    'barcode': '1234567890123'
                                },
                                'quantity': 25,
                                'location': 'ALM-01',
                                'updated_at': '2023-10-15T14:30:00Z'
                            }
                        ]
                    }
                }
            ),
            400: 'Parámetros de consulta inválidos',
            401: 'No autenticado',
            403: 'No tiene permiso para ver el inventario'
        }
    )
    def list(self, request, *args, **kwargs):
        """
        Lista todos los ítems de inventario con opciones de filtrado y paginación.
        """
        return super().list(request, *args, **kwargs)
    
    @swagger_auto_schema(
        operation_id='inventory_retrieve',
        operation_description='Obtiene los detalles de un ítem de inventario específico por su ID.',
        responses={
            200: InventorySerializer(),
            404: 'Ítem de inventario no encontrado',
            401: 'No autenticado',
            403: 'No tiene permiso para ver este ítem'
        }
    )
    def retrieve(self, request, *args, **kwargs):
        """
        Obtiene los detalles de un ítem de inventario específico.
        """
        return super().retrieve(request, *args, **kwargs)
    
    def get_queryset(self):
        """
        Filtra el queryset según los parámetros de consulta proporcionados.
        
        Parámetros soportados:
        - product_id: Filtrar por ID de producto
        - location: Filtrar por ubicación
        - min_quantity: Cantidad mínima en inventario
        - max_quantity: Cantidad máxima en inventario
        - in_stock: Filtrar por disponibilidad (true/false)
        """
        queryset = super().get_queryset()
        
        # Filtrado por ID de producto
        if 'product_id' in self.request.query_params:
            queryset = queryset.filter(product_id=self.request.query_params['product_id'])
            
        # Filtrado por ubicación
        if 'location' in self.request.query_params:
            queryset = queryset.filter(location=self.request.query_params['location'])
            
        # Filtrado por cantidad mínima
        if 'min_quantity' in self.request.query_params:
            queryset = queryset.filter(quantity__gte=self.request.query_params['min_quantity'])
            
        # Filtrado por cantidad máxima
        if 'max_quantity' in self.request.query_params:
            queryset = queryset.filter(quantity__lte=self.request.query_params['max_quantity'])
            
        # Filtrado por disponibilidad
        if 'in_stock' in self.request.query_params:
            in_stock = self.request.query_params['in_stock'].lower()
            if in_stock == 'true':
                queryset = queryset.filter(quantity__gt=0)
            elif in_stock == 'false':
                queryset = queryset.filter(quantity=0)
                
        return queryset
    
    @swagger_auto_schema(
        operation_id='inventory_movements',
        operation_description="""
        Obtiene el historial completo de movimientos para un ítem de inventario específico.
        
        Los movimientos incluyen entradas, salidas, ajustes y transferencias de inventario,
        ordenados cronológicamente del más reciente al más antiguo.
        
        ## Tipos de movimiento
        - `ENTRADA`: Ingreso de productos al inventario (compra, devolución, ajuste positivo)
        - `SALIDA`: Salida de productos del inventario (venta, consumo interno, ajuste negativo)
        - `TRANSFERENCIA`: Movimiento entre ubicaciones
        - `AJUSTE`: Ajuste manual de inventario
        
        ## Filtros disponibles
        - `start_date`: Fecha de inicio (formato: YYYY-MM-DD)
        - `end_date`: Fecha de fin (formato: YYYY-MM-DD)
        - `movement_type`: Tipo de movimiento (ENTRADA, SALIDA, TRANSFERENCIA, AJUSTE)
        - `reference`: Número de referencia u orden relacionada
        """,
        responses={
            200: openapi.Response(
                description='Historial de movimientos',
                schema=InventoryMovementSerializer(many=True),
                examples={
                    'application/json': [
                        {
                            'id': 1,
                            'inventory': 123,
                            'movement_type': 'ENTRADA',
                            'quantity': 10,
                            'previous_quantity': 5,
                            'new_quantity': 15,
                            'reference': 'OC-2023-001',
                            'notes': 'Ingreso por orden de compra',
                            'created_by': 'usuario1',
                            'created_at': '2023-10-15T14:30:00Z'
                        },
                        {
                            'id': 2,
                            'inventory': 123,
                            'movement_type': 'SALIDA',
                            'quantity': -2,
                            'previous_quantity': 15,
                            'new_quantity': 13,
                            'reference': 'VTA-2023-456',
                            'notes': 'Venta a cliente',
                            'created_by': 'usuario2',
                            'created_at': '2023-10-14T10:15:00Z'
                        }
                    ]
                }
            ),
            400: 'Parámetros de consulta inválidos',
            401: 'No autenticado',
            403: 'No tiene permiso para ver los movimientos',
            404: 'Ítem de inventario no encontrado'
        },
        manual_parameters=[
            openapi.Parameter(
                'start_date',
                openapi.IN_QUERY,
                description='Fecha de inicio para filtrar movimientos (YYYY-MM-DD)',
                type=openapi.TYPE_STRING,
                format=openapi.FORMAT_DATE
            ),
            openapi.Parameter(
                'end_date',
                openapi.IN_QUERY,
                description='Fecha de fin para filtrar movimientos (YYYY-MM-DD)',
                type=openapi.TYPE_STRING,
                format=openapi.FORMAT_DATE
            ),
            openapi.Parameter(
                'movement_type',
                openapi.IN_QUERY,
                description='Tipo de movimiento a filtrar',
                type=openapi.TYPE_STRING,
                enum=['ENTRADA', 'SALIDA', 'TRANSFERENCIA', 'AJUSTE']
            ),
            openapi.Parameter(
                'reference',
                openapi.IN_QUERY,
                description='Filtrar por número de referencia u orden',
                type=openapi.TYPE_STRING
            ),
            openapi.Parameter(
                'page', 
                openapi.IN_QUERY, 
                description="Número de página para la paginación", 
                type=openapi.TYPE_INTEGER
            ),
            openapi.Parameter(
                'page_size', 
                openapi.IN_QUERY, 
                description="Número de elementos por página", 
                type=openapi.TYPE_INTEGER
            )
        ]
    )
    @action(detail=True, methods=["get"], url_path="movements")
    def movements(self, request, pk=None):
        """
        Obtiene el historial completo de movimientos para un producto específico en el inventario.
        Los movimientos se ordenan por fecha de creación en orden descendente.
        """
        inventory = self.get_object()
        movements = inventory.movements.all().order_by("-created_at")

        # Aplicar paginación
        page = self.paginate_queryset(movements)
        if page is not None:
            serializer = InventoryMovementSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = InventoryMovementSerializer(movements, many=True)
        return Response(serializer.data)
    #GET /api/inventory/{id}/movements/
    #----------------------------------------------------------------

    @swagger_auto_schema(
        operation_description="Realiza un ajuste manual en el inventario de un producto.",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['change'],
            properties={
                'change': openapi.Schema(
                    type=openapi.TYPE_INTEGER, 
                    description='Cantidad a ajustar (positiva para aumentar, negativa para disminuir el inventario)'
                ),
                'reason': openapi.Schema(
                    type=openapi.TYPE_STRING, 
                    description='Motivo del ajuste',
                    default='Ajuste manual'
                ),
                'reference': openapi.Schema(
                    type=openapi.TYPE_STRING, 
                    description='Referencia opcional (ej. número de factura, nota de crédito, etc.)',
                    nullable=True
                )
            }
        ),
        responses={
            200: openapi.Response(
                description='Ajuste realizado exitosamente',
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'new_quantity': openapi.Schema(type=openapi.TYPE_INTEGER, description='Nueva cantidad en inventario')
                    }
                )
            ),
            400: 'Solicitud inválida. Verifique los datos proporcionados.',
            401: 'No autenticado',
            403: 'No tiene permisos para realizar esta acción',
            404: 'Producto no encontrado'
        }
    )
    @action(detail=True, methods=["post"], url_path="adjust")
    def adjust_stock(self, request, pk=None):
        """
        Realiza un ajuste manual en el inventario de un producto.
        
        Este endpoint permite incrementar o disminuir manualmente la cantidad disponible
        de un producto en el inventario, registrando el movimiento con una razón y referencia opcional.
        """
        inventory = self.get_object()

        try:
            change = int(request.data.get("change"))
            reason = request.data.get("reason", "Ajuste manual")
            reference = request.data.get("reference")

            new_quantity = move_inventory(
                product=inventory.product,
                quantity_change=change,
                reason=reason,
                reference=reference,
            )

            return Response(
                {"new_quantity": new_quantity},
                status=status.HTTP_200_OK
            )

        except ValueError as e:
            return Response(
                {"error": "El valor de 'change' debe ser un número entero"},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    #POST /api/inventory/{id}/adjust/
    #----------------------------------------------------------------