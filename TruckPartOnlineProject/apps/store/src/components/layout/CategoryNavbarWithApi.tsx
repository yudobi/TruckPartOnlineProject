"use client";

import { CategoryNavbar } from "@components/layout/CategoryNavbar";
import { useCategoriesWithSubcategories } from "@hooks/useCategories";

/**
 * Wrapper del CategoryNavbar que obtiene las categorías de la API automáticamente
 *
 * Este componente simplifica el uso del CategoryNavbar al manejar internamente
 * la carga de categorías desde la API sin necesidad de transformaciones.
 *
 * @example
 * ```tsx
 * import { CategoryNavbarWithApi } from "@components/layout/CategoryNavbarWithApi";
 *
 * export default function MyPage() {
 *   return <CategoryNavbarWithApi />;
 * }
 * ```
 */
export function CategoryNavbarWithApi() {
  const {
    data: categories,
    isLoading,
    error,
  } = useCategoriesWithSubcategories();

  // Mostrar un placeholder mientras carga
  if (isLoading) {
    return (
      <nav className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 bg-muted animate-pulse rounded" />
            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
          </div>
          <div className="h-8 w-32 bg-muted animate-pulse rounded" />
        </div>
      </nav>
    );
  }

  // Mostrar error si falla la carga
  if (error) {
    return (
      <nav className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-2 text-red-500 text-sm">
            <span>⚠️</span>
            <span>Error al cargar categorías</span>
          </div>
        </div>
      </nav>
    );
  }

  // Renderizar el navbar con las categorías directamente de la API
  return <CategoryNavbar categories={categories || []} />;
}
