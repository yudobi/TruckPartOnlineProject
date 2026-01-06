

# Create your models here.
from django.db import models

class QuickBooksToken(models.Model):
    access_token = models.TextField()
    refresh_token = models.TextField()
    realm_id = models.CharField(max_length=50)
    expires_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"QB Token {self.realm_id}"


from django.db import models

class QBItem(models.Model):
    qb_id = models.CharField(max_length=100, unique=True)
    name = models.CharField(max_length=255)
    sku = models.CharField(max_length=100, blank=True, null=True)
    qty_on_hand = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    active = models.BooleanField(default=True)
    raw_data = models.JSONField()

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
