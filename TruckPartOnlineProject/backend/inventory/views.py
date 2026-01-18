from django.shortcuts import render

# Create your views here.
from rest_framework.viewsets import ReadOnlyModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status

from .models import Inventory
from .serializers import (
    InventorySerializer,
    InventoryMovementSerializer,
)
from .services.inventory import move_inventory

class InventoryViewSet(ReadOnlyModelViewSet):
    """
    - Listar inventario
    - Ver inventario por producto
    """
    queryset = Inventory.objects.select_related("product")
    serializer_class = InventorySerializer
    #permission_classes = [IsAuthenticated]

    @action(detail=True, methods=["get"], url_path="movements")
    def movements(self, request, pk=None):
        inventory = self.get_object()
        movements = inventory.movements.all().order_by("-created_at")

        serializer = InventoryMovementSerializer(movements, many=True)
        return Response(serializer.data)
    #GET /api/inventory/{id}/movements/
    #----------------------------------------------------------------

    @action(detail=True, methods=["post"], url_path="adjust")
    def adjust_stock(self, request, pk=None):
        inventory = self.get_object()

        try:
            change = int(request.data.get("change"))
            reason = request.data.get("reason", "Ajuste manual")
            reference = request.data.get("reference")

            new_quantity = move_inventory(
                product=inventory.product,
                quantity_change=change,
                reason=reason,
                reference=reference,
            )

            return Response(
                {"new_quantity": new_quantity},
                status=status.HTTP_200_OK
            )

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    #POST /api/inventory/{id}/adjust/
    #----------------------------------------------------------------