"""from django.shortcuts import render
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser

from .models import Product, ProductImage
from .serializers import ProductSerializer, ProductImageSerializer
from products.pagination import StandardResultsSetPagination


class ProductViewSet(ModelViewSet):
    
    #API endpoint para gestionar productos.
   
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]  # Temporal, ajustar según permisos reales
    parser_classes = [MultiPartParser, FormParser]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        queryset = Product.objects.select_related("inventory")
        # Solo productos activos para usuarios no autenticados
        if not self.request.user.is_staff:
            queryset = queryset.filter(is_active=True)
        return queryset

    def get_permissions(self):
        
        #Permisos personalizados:
        #- Cualquiera puede ver la lista y detalles de productos
        #- Solo administradores pueden crear, actualizar o eliminar
        
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'upload_image', 'delete_image']:
            permission_classes = [IsAdminUser]
        else:
            permission_classes = [AllowAny]
        return [permission() for permission in permission_classes]

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def upload_image(self, request, pk=None):
        
        #Sube una imagen para un producto específico.
        #Solo accesible por administradores.
        
        product = self.get_object()
        serializer = ProductImageSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save(product=product)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

    @action(detail=True, methods=['delete'], url_path='images/(?P<image_id>[^/.]+)', permission_classes=[IsAdminUser])
    def delete_image(self, request, pk=None, image_id=None):
       
        #Elimina una imagen de un producto específico.
        #Solo accesible por administradores.
        
        try:
            image = ProductImage.objects.get(id=image_id, product_id=pk)
            image.delete()
            return Response(status=204)
        except ProductImage.DoesNotExist:
            return Response(
                {'detail': 'Imagen no encontrada'}, 
                status=404
            )
"""

from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser

from .models import Product, ProductImage
from .serializers import ProductSerializer, ProductImageSerializer, ProductSearchSerializer
from products.pagination import StandardResultsSetPagination


class ProductViewSet(ModelViewSet):
    """
    API endpoint para gestionar productos.
    """
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser, FormParser]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        queryset = Product.objects.select_related(
            "brand",
            "category",
            "inventory",
            "category__parent",
            "category__parent__parent",
            "category__parent__parent__parent",
        )

        # Solo productos activos para usuarios no admin
        if not self.request.user.is_staff:
            queryset = queryset.filter(is_active=True)

        params = self.request.query_params
        
         # 🔍 BÚSQUEDA POR NOMBRE
        if "search" in params:
          queryset = queryset.filter(
            name__icontains=params["search"]
        )


        # Filtro por Pieza
        if "piece" in params:
          queryset = queryset.filter(
            category_id=params["piece"],
            category__level="piece"
        )

        # Filtro por Sistema
        if "system" in params:
          queryset = queryset.filter(
            category__parent_id=params["system"]
        )

        # Filtro por Subcategoría
        if "subcategory" in params:
          queryset = queryset.filter(
            category__parent__parent_id=params["subcategory"]
        )

        # Filtro por Categoría principal
        if "category" in params:
         queryset = queryset.filter(
            category__parent__parent__parent_id=params["category"]
        )

        return queryset.distinct()

    def get_permissions(self):
        """
        - Lectura: cualquiera
        - Escritura: solo administradores
        """
        if self.action in [
            "create",
            "update",
            "partial_update",
            "destroy",
            "upload_image",
            "delete_image",
        ]:
            return [IsAdminUser()]
        return [AllowAny()]
    
    @action(detail=False, methods=["get"], url_path="search")
    def search(self, request):
        query = request.query_params.get("q", "")
        if not query:
           return Response([])

        products = Product.objects.filter(
           is_active=True,
            name__icontains=query
        ).order_by("name")[:10]  # 🔥 limite para menú

        serializer = ProductSearchSerializer(products, many=True)
        return Response(serializer.data)



    @action(detail=True, methods=["post"], permission_classes=[IsAdminUser])
    def upload_image(self, request, pk=None):
        """
        Sube una imagen para un producto específico.
        """
        product = self.get_object()
        serializer = ProductImageSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save(product=product)
            return Response(serializer.data, status=201)

        return Response(serializer.errors, status=400)

    @action(
        detail=True,
        methods=["delete"],
        url_path="images/(?P<image_id>[^/.]+)",
        permission_classes=[IsAdminUser],
    )
    def delete_image(self, request, pk=None, image_id=None):
        """
        Elimina una imagen de un producto específico.
        """
        try:
            image = ProductImage.objects.get(
                id=image_id,
                product_id=pk
            )
            image.delete()
            return Response(status=204)
        except ProductImage.DoesNotExist:
            return Response(
                {"detail": "Imagen no encontrada"},
                status=404
            )
