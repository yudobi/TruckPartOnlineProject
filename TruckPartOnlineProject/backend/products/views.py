from django.shortcuts import render

# Create your views here.
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import AllowAny, IsAdminUser

from .models import Product
from products.serializers import ProductSerializer
from rest_framework.response import Response



class ProductViewSet(ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = Product.objects.select_related("inventory")

        # Mostrar todos los productos (activos o no)
        return queryset
"""
class ProductViewSet(ModelViewSet):
    serializer_class = ProductSerializer

    def get_queryset(self):
        queryset = Product.objects.select_related("inventory")

        # Solo productos activos para usuarios normales
        if not self.request.user.is_staff:
            queryset = queryset.filter(is_active=True)

        return queryset

    def get_permissions(self):
        # Lectura pública
        if self.action in ["list", "retrieve"]:
            return [AllowAny()]

        # Escritura solo admin
        return [IsAdminUser()]
"""