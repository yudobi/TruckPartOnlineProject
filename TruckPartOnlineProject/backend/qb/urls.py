from django.urls import path
from .views import qb_login, qb_callback, sync_qb_items

urlpatterns = [
    path("login/", qb_login),
    path("callback/", qb_callback),
    path("items/sync/", sync_qb_items),
]