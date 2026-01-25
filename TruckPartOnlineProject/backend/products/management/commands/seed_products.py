import random
from django.core.management.base import BaseCommand
from products.models import Product, Brand, Category


class Command(BaseCommand):
    help = "Crea 20 productos de prueba con marcas y categorías"

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING("Creando datos de prueba..."))

        # Crear marcas si no existen
        brands_names = ["Samsung", "Apple", "Sony", "LG", "Xiaomi"]
        brands = []

        for name in brands_names:
            brand, _ = Brand.objects.get_or_create(name=name)
            brands.append(brand)

        # Crear categorías si no existen
        categories_names = ["Electrónica", "Audio", "Accesorios", "Computación"]
        categories = []

        for name in categories_names:
            category, _ = Category.objects.get_or_create(name=name)
            categories.append(category)

        products_created = 0

        for i in range(1, 21):
            product = Product.objects.create(
                name=f"Producto de prueba {i}",
                description=f"Descripción del producto de prueba número {i}",
                price=random.uniform(100, 5000),
                brand=random.choice(brands),
                category=random.choice(categories),
                sku=f"SKU-{1000 + i}",
                is_active=random.choice([True, True, True, False])  # mayoría activos
            )

            products_created += 1

        self.stdout.write(
            self.style.SUCCESS(f"✅ {products_created} productos creados correctamente")
        )
