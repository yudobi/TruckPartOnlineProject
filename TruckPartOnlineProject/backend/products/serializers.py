from rest_framework import serializers
from .models import Product, ProductImage, Brand, Category
from inventory.serializers import InventorySerializer


class CategorySerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = [
            "id",
            "name",
            "level",
            "parent",
            "qb_id",
            "children"
        ]
    
    def get_children(self, obj):
        children = obj.children.all().order_by("name")
        return CategorySerializer(children, many=True).data


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
    category = CategorySerializer(read_only=True)

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
