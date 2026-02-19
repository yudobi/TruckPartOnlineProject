

from django.contrib import admin
from .models import (
    Product,
    ProductImage,
    Brand,
    Category,
    CategoryImage
)
################################################################################################

class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1

################################################################################################

class CategoryImageInline(admin.TabularInline):
    model = CategoryImage
    extra = 1

################################################################################################

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'name',
        'sku',
        'price',
        'get_brand_display',
        'get_category_display',
        'is_active',
        'created_at'
    )

    list_filter = (
        'brand',
        'category',
        'category__level',
        'is_active',
        'created_at'
    )

    search_fields = ('name', 'sku', 'brand__name', 'category__name')
    list_editable = ('is_active',)
    list_select_related = ('brand', 'category')
    
    # Ordenar por marca, categoría y nombre
    ordering = ('brand__name', 'category__name', 'name')

    inlines = [ProductImageInline]

    def get_brand_display(self, obj):
        """Muestra el fabricante/marca"""
        if obj.brand:
            return obj.brand.name
        return "-"
    get_brand_display.short_description = "Fabricante"
    get_brand_display.admin_order_field = 'brand__name'

    def get_category_display(self, obj):
        """Muestra la categoría completa (nivel: nombre)"""
        if obj.category:
            return f"{obj.category.get_level_display()}: {obj.category.name}"
        return "-"
    get_category_display.short_description = "Categoría"
    get_category_display.admin_order_field = 'category__name'

    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'brand', 'category'
        )
################################################################################################

@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ('name', 'qb_id')
    search_fields = ('name',)

################################################################################################

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'name',
        'level',
        'parent'
    )

    list_filter = ('level',)
    search_fields = ('name',)
    ordering = ('level', 'name')

    inlines = [CategoryImageInline]

    #autocomplete_fields = ('parent',)

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('parent')
    
################################################################################################