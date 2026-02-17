# Filtro de Fabricantes Actualizado

## Cambios realizados

### 1. Backend (Django)

#### `products/views.py` - BrandViewSet
- Ahora solo retorna marcas que tienen productos activos
- Parámetro opcional `?all=true` para obtener todas las marcas
- Endpoint: `GET /api/brands/`

#### `products/views.py` - ProductViewSet
- Ahora soporta tanto `?brands=` como `?manufacturer=` para filtrar por marca
- Ambos parámetros funcionan igual y aceptan IDs separados por coma

### 2. Frontend (React)

#### Nuevo servicio: `services/brandService.ts`
- `getAllBrands()` - Obtiene marcas con productos
- `getAllBrands(true)` - Obtiene todas las marcas
- `getBrandById(id)` - Obtiene una marca específica

#### Nuevo hook: `hooks/useBrands.ts`
- `useBrands()` - Hook para obtener marcas con productos
- `useBrandById(id)` - Hook para obtener una marca específica

#### Tipos actualizados: `types/product.ts`
- Agregada interfaz `Brand` con `id`, `name`, `logo`

#### Componente actualizado: `pages/ProductsPage.tsx`
- **Eliminado**: `MOCK_MANUFACTURERS` (fabricantes hardcodeados)
- **Agregado**: Carga dinámica de fabricantes desde la API
- **Mejorado**: 
  - Muestra solo fabricantes que tienen productos
  - Estados de carga y error
  - Filtro activo muestra nombre de marca en lugar de ID
  - Filtra por ID de marca (más eficiente)

## Cómo funciona ahora

1. Al cargar la página de productos, se obtienen las marcas desde `/api/brands/`
2. Solo se muestran las marcas que tienen al menos un producto activo
3. Al hacer clic en una marca, se filtra por el ID de la marca
4. El filtro activo muestra el nombre legible de la marca

## Ejemplo de respuesta de la API

```json
[
  {
    "id": 1,
    "name": "Cummins",
    "logo": "/media/brands/cummins.png"
  },
  {
    "id": 2,
    "name": "Caterpillar",
    "logo": null
  }
]
```

## Beneficios

- ✅ Solo se muestran fabricantes relevantes (con productos)
- ✅ No hay fabricantes "vacíos" en los filtros
- ✅ Datos dinámicos desde la base de datos
- ✅ Filtro por ID más eficiente que por nombre
- ✅ Mejor experiencia de usuario
