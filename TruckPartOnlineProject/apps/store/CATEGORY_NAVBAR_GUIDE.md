# Guía de Integración del CategoryNavbar con API

## Descripción

El componente `CategoryNavbar` proporciona una navegación jerárquica de categorías y subcategorías con soporte para desktop y mobile. **Ahora está configurado para obtener las categorías dinámicamente desde tu API** usando React Query.

## Características

- ✅ **Navegación jerárquica**: Muestra categorías y subcategorías en un menú desplegable
- ✅ **Responsive**: Vista de dropdown para desktop y sheet lateral para mobile
- ✅ **Hover interactivo**: Submenús que se despliegan al pasar el mouse (desktop)
- ✅ **Collapsible**: Menús expandibles en mobile
- ✅ **API Integration**: Obtiene categorías dinámicamente desde tu backend
- ✅ **React Query**: Caché automático y revalidación de datos
- ✅ **Estados de carga**: Manejo de loading y errores

## Archivos Creados/Modificados

1. **`CategoryNavbar.tsx`**: Componente principal de navegación
2. **`categoryNavHelpers.ts`**: Funciones helper para transformar categorías (actualizado con soporte para API)
3. **`scroll-area.tsx`**: Componente UI para áreas scrolleables
4. **`separator.tsx`**: Componente UI para separadores visuales
5. **`CategoryNavbarExample.tsx`**: Ejemplo de uso con API

## Cómo Usar con API

### Opción 1: Usar en cualquier componente (Recomendado)

```tsx
import { CategoryNavbar } from "@components/layout/CategoryNavbar";
import { useCategoriesWithSubcategories } from "@hooks/useCategories";
import { transformApiCategoriesToNavFormat } from "@lib/categoryNavHelpers";

export default function MyPage() {
  // Obtener categorías de la API
  const { data: apiCategories, isLoading, error } = useCategoriesWithSubcategories();
  
  // Transformar al formato del navbar
  const categories = apiCategories 
    ? transformApiCategoriesToNavFormat(apiCategories)
    : [];

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <CategoryNavbar categories={categories} />
      {/* Tu contenido */}
    </div>
  );
}
```

### Opción 2: Integrar en tu Navbar existente

Actualiza tu `Navbar.tsx` para usar las categorías de la API:

```tsx
import { CategoryNavbar } from "@components/layout/CategoryNavbar";
import { useCategoriesWithSubcategories } from "@hooks/useCategories";
import { transformApiCategoriesToNavFormat } from "@lib/categoryNavHelpers";

export default function Navbar() {
  const { data: apiCategories } = useCategoriesWithSubcategories();
  const categories = apiCategories 
    ? transformApiCategoriesToNavFormat(apiCategories)
    : [];

  return (
    <nav>
      {/* ... resto del navbar ... */}
      
      {/* Reemplaza el DropdownMenu de categorías con: */}
      {categories.length > 0 && <CategoryNavbar categories={categories} />}
      
      {/* ... resto del navbar ... */}
    </nav>
  );
}
```

### Opción 3: Usar categorías estáticas (fallback)

Si necesitas usar las categorías estáticas mientras la API no está disponible:

```tsx
import { getCategoriesForNav } from "@lib/categoryNavHelpers";

// Usar categorías estáticas
const categories = getCategoriesForNav();
```

## Flujo de Datos

1. **Hook de React Query** (`useCategoriesWithSubcategories`):
   - Hace una petición GET a `/api/categories/tree/`
   - Cachea los resultados por 5 minutos
   - Revalida automáticamente cuando es necesario

2. **Transformación** (`transformApiCategoriesToNavFormat`):
   - Convierte `CategoryTree[]` (API) → `CategoryForNav[]` (Navbar)
   - Mapea campos: `code` → `slug`, `short_name` → `name`
   - Procesa recursivamente los `children`

3. **Renderizado** (`CategoryNavbar`):
   - Recibe las categorías transformadas
   - Renderiza el menú responsive
   - Maneja la navegación con `useNavigate`

## Estructura de Datos

### Desde la API (`CategoryTree`):
```typescript
{
  id: number;
  code: string;           // "A", "B", etc.
  name: string;           // "SISTEMAS MECÁNICOS PRINCIPALES"
  short_name: string;     // "Mecánicos"
  short_name_en: string;  // "Mechanical"
  level: number;
  parent: number | null;
  children?: CategoryTree[];  // Subcategorías anidadas
}
```

### Transformado para Navbar (`CategoryForNav`):
```typescript
{
  id: string;        // "A" (del code)
  name: string;      // "Mecánicos" (del short_name)
  slug: string;      // "A" (del code)
  children?: CategoryForNav[];
}
```

## Navegación

El componente genera URLs en el formato:
- `/products?category={code}` (ej: `/products?category=A`)

Esto es compatible con tu sistema actual de filtrado por categorías.

## Manejo de Estados

### Loading State
```tsx
if (isLoading) {
  return (
    <div className="flex items-center gap-2">
      <div className="animate-spin h-4 w-4 border-2 border-foreground border-t-transparent rounded-full" />
      <span>Cargando categorías...</span>
    </div>
  );
}
```

### Error State
```tsx
if (error) {
  return (
    <div className="text-red-500">
      Error al cargar categorías: {error.message}
    </div>
  );
}
```

### Empty State
```tsx
if (!categories || categories.length === 0) {
  return <div>No hay categorías disponibles</div>;
}
```

## Caché y Rendimiento

React Query maneja automáticamente:
- **Caché**: Los datos se cachean por 5 minutos (`staleTime`)
- **Revalidación**: Se revalida en segundo plano cuando los datos están obsoletos
- **Deduplicación**: Múltiples llamadas simultáneas se combinan en una sola petición
- **Garbage Collection**: Los datos no usados se limpian después de 10 minutos

## Personalización

### Cambiar el tiempo de caché

Edita `src/hooks/useCategories.ts`:

```typescript
export const useCategoriesWithSubcategories = () => {
  return useQuery<CategoryTree[], Error>({
    queryKey: ['categories', 'tree'],
    queryFn: () => categoryService.getAllCategoriesWithSubcategories(),
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 20 * 60 * 1000,    // 20 minutos
  });
};
```

### Forzar recarga

```tsx
const { data, refetch } = useCategoriesWithSubcategories();

// Recargar manualmente
<button onClick={() => refetch()}>
  Recargar categorías
</button>
```

### Prefetch (precarga)

```tsx
import { useQueryClient } from '@tanstack/react-query';
import { categoryService } from '@services/categoryService';

function App() {
  const queryClient = useQueryClient();
  
  // Precargar categorías al iniciar la app
  useEffect(() => {
    queryClient.prefetchQuery({
      queryKey: ['categories', 'tree'],
      queryFn: () => categoryService.getAllCategoriesWithSubcategories(),
    });
  }, []);
}
```

## Ejemplo Completo

Ver `CategoryNavbarExample.tsx` para un ejemplo completo con:
- ✅ Carga de categorías desde API
- ✅ Estados de loading y error
- ✅ Transformación de datos
- ✅ Renderizado del navbar
- ✅ Grid de categorías con links

## Troubleshooting

### Las categorías no se cargan

1. Verifica que el backend esté corriendo
2. Revisa la URL de la API en `.env`:
   ```
   VITE_API_BASE_URL=http://localhost:8000/api
   ```
3. Verifica que el endpoint `/categories/tree/` exista
4. Revisa la consola del navegador para errores

### Error de CORS

Si ves errores de CORS, configura tu backend Django para permitir el origen del frontend.

### Categorías vacías

Si `categories.length === 0`, verifica:
1. Que haya categorías en la base de datos
2. Que el endpoint retorne datos correctamente
3. Que la transformación no esté filtrando categorías

## Próximos Pasos

1. ✅ Revisa el ejemplo en `CategoryNavbarExample.tsx`
2. ✅ Integra el componente en tu Navbar principal
3. ✅ Prueba la carga desde la API
4. ✅ Personaliza estilos según tu diseño
5. ✅ Configura el caché según tus necesidades

## Notas Importantes

- El componente usa **React Query** para el manejo de estado asíncrono
- Las categorías se **cachean automáticamente** para mejor rendimiento
- La transformación es **recursiva** para soportar múltiples niveles
- Compatible con tu **sistema de navegación existente**
