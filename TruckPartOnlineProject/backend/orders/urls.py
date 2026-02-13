from django.urls import path
from . import views

urlpatterns = [
    path("order/products/", views.products_list),
    path("my-orders/", views.my_orders),
    path("checkout/", views.checkout),
    path("<int:order_id>/pay/", views.pay_order),
    path("<int:order_id>/", views.order_detail),
]