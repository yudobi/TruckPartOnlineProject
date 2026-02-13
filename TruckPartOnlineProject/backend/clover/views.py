
from django.shortcuts import redirect
from django.http import JsonResponse
from clover.models import CloverMerchant
from .oauth import get_clover_tokens


def clover_oauth_callback(request):
    print("🔥 CALLBACK EJECUTADO")
    code = request.GET.get("code")
    merchant_id = request.GET.get("merchant_id")

    if not code:
        return JsonResponse({"error": "No code provided"}, status=400)

    if not merchant_id:
        return JsonResponse({"error": "No merchant_id provided"}, status=400)

    try:
        token_data = get_clover_tokens(code)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)

    access_token = token_data.get("access_token")
    refresh_token = token_data.get("refresh_token")  # sandbox normalmente no lo manda
    

   

    CloverMerchant.objects.update_or_create(
        merchant_id=merchant_id,
        defaults={
            "access_token": access_token if access_token else None,
            "refresh_token": refresh_token if refresh_token else None,
            "name": merchant_id,
        }
    )

    return JsonResponse({
        "status": "success",
        "merchant_id": merchant_id,
        "access_token": access_token
    })
