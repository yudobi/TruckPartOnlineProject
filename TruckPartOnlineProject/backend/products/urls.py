from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet, BrandViewSet, CategoryViewSet

router = DefaultRouter()
router.register(r"products", ProductViewSet, basename="product")
router.register(r"brands", BrandViewSet)
router.register(r"categories", CategoryViewSet, basename="category")

urlpatterns = [
    path("", include(router.urls)),
]
