from django.contrib import admin

# Register your models here.

from .models import Inventory, InventoryMovement

class InventoryMovementInline(admin.TabularInline):
    model = InventoryMovement
    extra = 0
    readonly_fields = ('created_at',)



@admin.register(Inventory)
class InventoryAdmin(admin.ModelAdmin):
    list_display = (
        'product',
        'quantity',
        'updated_at'
    )

    readonly_fields = ('product', 'updated_at')
    search_fields = ('product__name',)
    inlines = [InventoryMovementInline]

    def has_add_permission(self, request):
        # El inventario se crea automáticamente por señal
        return False


@admin.register(InventoryMovement)
class InventoryMovementAdmin(admin.ModelAdmin):
    list_display = (
        'inventory',
        'change',
        'reason',
        'reference',
        'created_at'
    )

    readonly_fields = ('created_at',)
    list_filter = ('reason',)
    search_fields = ('inventory__product__name', 'reference')
