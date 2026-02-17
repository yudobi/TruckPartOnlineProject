# Mejoras en el Admin y API de Productos

## Cambios realizados

### 1. Admin de Django (products/admin.py)

El listado de productos ahora muestra:

- **ID**: Identificador del producto
- **Nombre**: Nombre del producto
- **SKU**: Código SKU
- **Precio**: Precio de venta
- **Fabricante**: Marca/Brand del producto (con método personalizado)
- **Categoría**: Categoría del producto en formato "Nivel: Nombre"
- **Activo**: Estado del producto
- **Fecha creación**: Cuándo se creó

#### Funcionalidades:
- **Filtros**: Por marca, categoría, nivel de categoría, estado activo, fecha
- **Búsqueda**: Por nombre, SKU, nombre de marca, nombre de categoría
- **Ordenación**: Por marca → categoría → nombre
- **Edición rápida**: Puedes cambiar el estado "Activo" directamente desde el listado

### 2. API REST (products/serializers.py)

El serializer de Productos ahora incluye el campo `brand` con la información completa:

```json
{
  "id": 1,
  "name": "Producto ejemplo",
  "description": "Descripción del producto",
  "price": "99.99",
  "sku": "SKU-001",
  "is_active": true,
  "inventory": {...},
  "images": [...],
  "category": {
    "id": 1,
    "name": "SISTEMAS MECÁNICOS PRINCIPALES",
    "level": "category",
    ...
  },
  "brand": {
    "id": 1,
    "name": "Cummins",
    "logo": "url/to/logo.png"
  },
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

### 3. Optimización de Queries (products/views.py)

El `ProductViewSet` usa `select_related` para cargar eficientemente:
- `brand`: Información del fabricante
- `category`: Información de la categoría
- `inventory`: Información de inventario
- Relaciones padre de categoría (para filtros jerárquicos)

Esto evita consultas N+1 cuando se listan productos.

## Ejemplo de uso de la API

```bash
# Obtener todos los productos con sus marcas y categorías
curl "http://localhost:8000/api/products/"

# Filtrar por marca (usando brand_id)
curl "http://localhost:8000/api/products/?brands=1,3"

# Buscar productos
curl "http://localhost:8000/api/products/?search=filtro"

# Filtrar por categoría
curl "http://localhost:8000/api/products/?category=1"
```

## Notas

- No se requieren migraciones de base de datos
- El campo brand ya existía en el modelo Product
- Solo se mejoró la visualización en el admin y se incluyó en la API
