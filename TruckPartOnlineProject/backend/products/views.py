
from decimal import Decimal, InvalidOperation

from rest_framework.viewsets import ModelViewSet, ReadOnlyModelViewSet
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser

from .models import Product, ProductImage, Brand, Category
from .serializers import ProductSerializer, ProductImageSerializer, ProductSearchSerializer, BrandSerializer, CategorySerializer
from products.pagination import StandardResultsSetPagination

from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

ALLOWED_ORDERINGS = {
    "price": "price",
    "-price": "-price",
    "name": "name",
    "-name": "-name",
    "-created_at": "-created_at",
}


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
          

        # Filtro por Marca (soporta 'brands' o 'manufacturer')
        brand_param = params.get("brands") or params.get("manufacturer")
        if brand_param:
            brand_ids = brand_param.split(",")
            queryset = queryset.filter(brand_id__in=brand_ids)

            

        # Filtro por Pieza (soporta múltiples IDs separados por coma)
        if "piece" in params:
            piece_ids = params["piece"].split(",")
            queryset = queryset.filter(
                category_id__in=piece_ids,
                category__level="piece",
            )

        # Filtro por Sistema (soporta múltiples IDs separados por coma)
        if "system" in params:
            system_ids = params["system"].split(",")
            queryset = queryset.filter(category__parent_id__in=system_ids)

        # Filtro por Subcategoría (soporta múltiples IDs separados por coma)
        if "subcategory" in params:
            sub_ids = params["subcategory"].split(",")
            queryset = queryset.filter(category__parent__parent_id__in=sub_ids)

        # Filtro por Categoría principal (soporta múltiples IDs separados por coma)
        if "category" in params:
            cat_ids = params["category"].split(",")
            queryset = queryset.filter(category__parent__parent__parent_id__in=cat_ids)

        # Filtro por Precio mínimo
        if "min_price" in params:
            try:
                queryset = queryset.filter(price__gte=Decimal(params["min_price"]))
            except InvalidOperation:
                pass

        # Filtro por Precio máximo
        if "max_price" in params:
            try:
                queryset = queryset.filter(price__lte=Decimal(params["max_price"]))
            except InvalidOperation:
                pass

        # Ordenamiento (whitelist para evitar inyección de campos)
        ordering_param = params.get("ordering")
        if ordering_param and ordering_param in ALLOWED_ORDERINGS:
            queryset = queryset.order_by(ALLOWED_ORDERINGS[ordering_param])
        else:
            queryset = queryset.order_by("-created_at")

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
        
        # Para retrieve (obtener un producto específico) permitir a staff
        if self.action == "retrieve" and self.request.user.is_staff:
            return [AllowAny()]  # O podrías usar un permiso personalizado

        return [AllowAny()]
    

    @swagger_auto_schema(
    manual_parameters=[
        openapi.Parameter(
            'q',
            openapi.IN_QUERY,
            description="Texto para autocomplete de productos",
            type=openapi.TYPE_STRING,
            required=True,
        ),
    ],
    responses={200: ProductSearchSerializer(many=True)},
    tags=["Productos"],
    )
    
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
        

    @swagger_auto_schema(
    manual_parameters=[
        openapi.Parameter(
            'brands',
            openapi.IN_QUERY,
            description="IDs de marcas separados por coma (ej: 1,3,5)",
            type=openapi.TYPE_STRING,
            required=False,
        ),
        openapi.Parameter(
            'search',
            openapi.IN_QUERY,
            description="Buscar productos por nombre",
            type=openapi.TYPE_STRING,
            required=False,
        ),
   ]
   )
    def list(self, request, *args, **kwargs):
       return super().list(request, *args, **kwargs)


class BrandViewSet(ReadOnlyModelViewSet):
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer
    
    def get_queryset(self):
        """
        Retorna solo las marcas que tienen productos activos.
        Si se pasa ?all=true, retorna todas las marcas.
        """
        queryset = Brand.objects.all().order_by("name")
        
        # Si no se pide todas, filtrar solo las que tienen productos activos
        if self.request.query_params.get("all") != "true":
            queryset = queryset.filter(
                products__is_active=True
            ).distinct()
        
        return queryset


class CategoryViewSet(ModelViewSet):
    """
    API endpoint para gestionar categorías.
    """
    serializer_class = CategorySerializer
    permission_classes = [IsAdminUser]
    
    def get_queryset(self):
        return Category.objects.select_related(
            "parent",
            "parent__parent",
            "parent__parent__parent"
        ).order_by("level", "name")
    
    def get_permissions(self):
        """
        - Lectura: cualquiera
        - Escritura: solo administradores
        """
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsAdminUser()]
        return [AllowAny()]
    
    @action(detail=False, methods=["get"], permission_classes=[AllowAny])
    def tree(self, request):
        """
        Retorna la estructura de categorías en formato de árbol jerárquico completo.
        """
        categories = Category.objects.filter(parent=None).prefetch_related(
            "children__children__children__children"
        ).order_by("name")
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)

######################################################################################################
