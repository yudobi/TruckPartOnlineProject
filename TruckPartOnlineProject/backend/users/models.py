from django.db import models

from django.contrib.auth.models import AbstractUser
from django.contrib.auth import get_user_model

class User(AbstractUser):

    first_name = None
    last_name = None
    
    full_name = models.CharField(max_length=255, null=True, blank=True)
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=20, unique=True, null=True, blank=True)
    address = models.TextField(null=True, blank=True)

    email_verified = models.BooleanField(default=False)
    is_active = models.BooleanField(default=False)

    is_guest = models.BooleanField(default=False)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.email or self.username
    
User = get_user_model()

class PasswordResetRequest(models.Model):

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    new_password = models.CharField(max_length=255)

    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)

    def __str__(self):
        return f"Reset for {self.user.email}"    