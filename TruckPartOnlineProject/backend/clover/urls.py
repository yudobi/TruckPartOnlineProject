from django.urls import path
from .views import clover_oauth_callback

urlpatterns = [
    path("oauth/callback", clover_oauth_callback, name="clover_oauth_callback"),
]