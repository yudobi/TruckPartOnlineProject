from django.db import models

class CloverMerchant(models.Model):
    merchant_id = models.CharField(max_length=64, unique=True)
    name = models.CharField(max_length=255, blank=True)
    access_token = models.TextField()
    refresh_token = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name or self.merchant_id




class CloverProduct(models.Model):
    merchant = models.ForeignKey(CloverMerchant, on_delete=models.CASCADE)
    clover_item_id = models.CharField(max_length=64)
    name = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    currency = models.CharField(max_length=10, default="MXN")
    available = models.BooleanField(default=True)
    hidden = models.BooleanField(default=False)
    auto_manage = models.BooleanField(default=False)
    price_type = models.CharField(max_length=20, default="FIXED")
    default_tax_rates = models.BooleanField(default=True)
    is_revenue = models.BooleanField(default=True)
    modified_time = models.DateTimeField(null=True, blank=True)
    deleted = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("merchant", "clover_item_id")

    def __str__(self):
        return self.name
