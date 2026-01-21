from django.urls import path
from .views import qb_login, qb_callback
from . import views

urlpatterns = [
    path("login/", qb_login),
    path("callback/", qb_callback),
    #path("items/sync/", sync_qb_items),
    
]