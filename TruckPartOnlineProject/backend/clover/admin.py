from django.contrib import admin
from django.utils.html import format_html
from django.conf import settings
from django.contrib import messages

from .models import CloverMerchant
from .services.clover_sync import sync_clover_prices


@admin.register(CloverMerchant)
class CloverMerchantAdmin(admin.ModelAdmin):
    list_display = (
        "merchant_id",
        "name",
        "created_at",
        "connect_button",
    )

    readonly_fields = ("created_at",)
    exclude = ("access_token", "refresh_token")
    search_fields = ("merchant_id", "name")
    actions = ["sync_prices_action"]

    # 🔄 Acción manual desde dropdown
    def sync_prices_action(self, request, queryset):
        success_count = 0
        error_count = 0

        for merchant in queryset:
            try:
                sync_clover_prices(merchant)
                success_count += 1
            except Exception as e:
                error_count += 1
                self.message_user(
                    request,
                    f"Error sincronizando {merchant.merchant_id}: {str(e)}",
                    level=messages.ERROR
                )

        if success_count:
            self.message_user(
                request,
                f"{success_count} merchant(s) sincronizado(s) correctamente.",
                level=messages.SUCCESS
            )

        if error_count:
            self.message_user(
                request,
                f"{error_count} merchant(s) tuvieron errores.",
                level=messages.WARNING
            )

    sync_prices_action.short_description = "Sincronizar precios desde Clover"

    # 🔗 Botón OAuth dinámico (sandbox / production automático)
    def connect_button(self, obj=None):
        clover_config = getattr(settings, "CLOVER", None)

        if not clover_config:
            return "CLOVER config no encontrada"

        redirect_uri = clover_config.get("REDIRECT_URI")
        client_id = clover_config.get("APP_ID")
        base_url = clover_config.get("BASE_URL")

        if not redirect_uri or not client_id or not base_url:
            return "CLOVER mal configurado"

        oauth_url = (
            f"{base_url}/oauth/authorize?"
            f"client_id={client_id}&"
            "response_type=code&"
            f"redirect_uri={redirect_uri}"
        )

        return format_html(
            '<a class="button" style="padding:4px 8px; background:#28a745; '
            'color:white; border-radius:4px;" '
            'href="{}" target="_blank">Conectar Clover</a>',
            oauth_url
        )

    connect_button.short_description = "Conectar Clover"
