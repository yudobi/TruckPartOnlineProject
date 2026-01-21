from django.contrib import admin

# Register your models here.

from .models import Product, ProductImage, Brand, Category
class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'name',
        'price',
        'brand',
        'category',
        'is_active',
        'created_at'
    )

    list_filter = ('brand', 'category', 'is_active')
    search_fields = ('name', 'sku')
    list_editable = ('is_active',)

    inlines = [ProductImageInline]

@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ('name', 'qb_id')
    search_fields = ('name',)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'qb_id')
    search_fields = ('name',)
