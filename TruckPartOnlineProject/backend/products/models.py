from django.db import models

from django.db import models

########################################################################################
class Brand(models.Model):
    name = models.CharField(max_length=100, unique=True)
    qb_id = models.CharField(
        max_length=50,
        null=True,
        blank=True,
        help_text="ID de la marca en QuickBooks (si aplica)"
    )
    logo = models.ImageField(
        upload_to="brands/",
        null=True,
        blank=True
    )

    def __str__(self):
        return self.name
########################################################################################
"""
class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    qb_id = models.CharField(
        max_length=50,
        null=True,
        blank=True,
        help_text="ID de la categoría en QuickBooks"
    )

    def __str__(self):
        return self.name
"""  
class Category(models.Model):
    name = models.CharField(max_length=100)
    qb_id = models.CharField(
        max_length=50,
        null=True,
        blank=True
    )

    parent = models.ForeignKey(
        "self",
        null=True,
        blank=True,
        related_name="children",
        on_delete=models.CASCADE
    )

    LEVEL_CHOICES = (
        ("category", "Categoría"),
        ("subcategory", "Subcategoría"),
        ("system", "Sistema"),
        ("piece", "Pieza"),
    )

    level = models.CharField(max_length=20, choices=LEVEL_CHOICES)

    class Meta:
        unique_together = ("name", "parent")

    def __str__(self):
        return self.name
    
#--------------------------------------------------------------------------------#

class CategoryImage(models.Model):
    category = models.ForeignKey(
        Category,
        related_name="images",
        on_delete=models.CASCADE
    )
    image = models.ImageField(upload_to="categories/")
    is_main = models.BooleanField(default=False)

########################################################################################
class Product(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)

    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Precio de venta (ya no viene de QuickBooks)"
    )

    brand = models.ForeignKey(
        Brand,
        on_delete=models.SET_NULL,
        null=True,
        related_name="products"
    )

    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        related_name="products"
    )
    #Campo para almacenar el ID del ítem en QuickBooks para sincronización de stock pero no obligatorio
    #No se va a usar por ahora pero queda para futuras implementaciones 
    qb_item_id = models.CharField(
    max_length=50,
    null=True,
    blank=True,
    unique=True,
    help_text="ID del Item en QuickBooks (opcional)"
)


    sku = models.CharField(
        max_length=100,
        null=True,
        blank=True
    )

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

#--------------------------------------------------------------------------------#

class ProductImage(models.Model):
    product = models.ForeignKey(
        Product,
        related_name="images",
        on_delete=models.CASCADE
    )
    image = models.ImageField(upload_to="products/")
    is_main = models.BooleanField(default=False)
########################################################################################
