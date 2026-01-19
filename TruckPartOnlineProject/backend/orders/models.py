from django.db import models
from django.contrib.auth.models import User
from products.models import Product
from django.conf import settings


class Order(models.Model):
    STATUS_CHOICES = (
        ("pending", "Pending"),
        ("invoiced", "Invoiced"),
        ("completed", "Completed"),
        ("failed", "Failed"),
    )

    PAYMENT_METHODS = (
        ("cod", "Cash on Delivery"),
        ("card", "Card"),
    )

    PAYMENT_STATUS = (
        ("pending", "Pending"),
        ("paid", "Paid"),
        ("failed", "Failed"),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='orders'
    )
    guest_email = models.EmailField(null=True, blank=True)
    phone = models.CharField(max_length=20, null=True, blank=True)
    shipping_address = models.TextField(null=True, blank=True)
    country = models.CharField(max_length=100, null=True, blank=True)
    state = models.CharField(max_length=100, null=True, blank=True)
    city = models.CharField(max_length=100, null=True, blank=True)
    postal_code = models.CharField(max_length=20, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")

    payment_method = models.CharField(
        max_length=10,
        choices=PAYMENT_METHODS,
        default="cod"
    )

    payment_status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS,
        default="pending"
    )

    
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    qb_invoice_id = models.CharField(max_length=50, null=True, blank=True)
    qb_sales_receipt_id = models.CharField(max_length=50, null=True, blank=True)

    def is_guest(self):
        return self.user is None

    def __str__(self):
        return f"Order #{self.id}"






class OrderItem(models.Model):
    order = models.ForeignKey(
        Order,
        related_name="items",
        on_delete=models.CASCADE
    )

    product = models.ForeignKey(
        Product,
        on_delete=models.PROTECT
    )

    quantity = models.PositiveIntegerField()

    price = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    def __str__(self):
        return f"{self.product} x {self.quantity}"


