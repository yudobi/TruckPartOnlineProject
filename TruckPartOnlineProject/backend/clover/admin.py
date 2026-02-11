# clover/admin.py
from django.contrib import admin
from django.utils.html import format_html
from django.conf import settings
from .models import CloverMerchant
from .services.clover_sync import sync_clover_prices

@admin.register(CloverMerchant)
class CloverMerchantAdmin(admin.ModelAdmin):
    list_display = ("merchant_id", "name", "created_at", "connect_button")
    readonly_fields = ("created_at",)
    exclude = ("access_token", "refresh_token")  # ocultar tokens
    search_fields = ("merchant_id", "name")
    actions = ["sync_prices"]

    def sync_prices(self, request, queryset):
        for merchant in queryset:
            sync_clover_prices(merchant)
        self.message_user(request, "Precios sincronizados correctamente")
    sync_prices.short_description = "Sincronizar precios desde Clover"

    def connect_button(self, obj=None):
        """
        Botón para agregar un nuevo merchant vía OAuth
        """
        redirect_uri = getattr(settings, "CLOVER_REDIRECT_URI", None)
        if not redirect_uri:
            return "CLOVER_REDIRECT_URI no configurado en settings"
        
        oauth_url = (
            f"https://sandbox.dev.clover.com/oauth/authorize?"
            f"client_id={settings.CLOVER_APP_ID}&"
            f"response_type=code&"
            f"redirect_uri={redirect_uri}"
        )
        return format_html(f'<a class="button" href="{oauth_url}" target="_blank">Agregar Merchant</a>')

    connect_button.short_description = "Conectar Clover"
