from rest_framework import serializers
from .models import Product, ProductImage, Brand
from inventory.serializers import InventorySerializer


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = [
            "id",
            "image",
            "is_main",
        ]


class ProductSerializer(serializers.ModelSerializer):
    inventory = InventorySerializer(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "description",
            "price",
            "sku",
            "is_active",
            "inventory",
            "images",
            "category",
            "created_at",
            "updated_at",
        ]




class ProductSearchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ("id", "name")



class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = ("id", "name", "logo")
