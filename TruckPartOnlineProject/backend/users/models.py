from django.db import models

from django.contrib.auth.models import AbstractUser

class User(AbstractUser):

    first_name = None
    last_name = None
    
    full_name = models.CharField(max_length=255, null=True, blank=True)
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=20, unique=True, null=True, blank=True)
    address = models.TextField(null=True, blank=True)

    is_guest = models.BooleanField(default=False)

    def __str__(self):
        return self.email or self.username