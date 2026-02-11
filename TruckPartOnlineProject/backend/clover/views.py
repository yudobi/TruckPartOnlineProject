from django.http import JsonResponse
from clover.models import CloverMerchant
from .oauth import get_clover_tokens

def clover_oauth_callback(request):
    code = request.GET.get("code")
    if not code:
        return JsonResponse({"error": "No code provided"}, status=400)

    # Intercambia code por tokens
    try:
        token_data = get_clover_tokens(code)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)

    merchant_id = token_data["merchant_id"]
    access_token = token_data["access_token"]
    refresh_token = token_data.get("refresh_token")

    # Guardar o actualizar merchant
    merchant, _ = CloverMerchant.objects.update_or_create(
        merchant_id=merchant_id,
        defaults={
            "access_token": access_token,
            "refresh_token": refresh_token,
            "name": merchant_id
        }
    )

    return JsonResponse({
        "message": "Clover conectado correctamente",
        "merchant_id": merchant_id
    })
