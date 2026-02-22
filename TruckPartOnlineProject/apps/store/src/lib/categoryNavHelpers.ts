import categories from "./categories";
import type { CategoryTree } from "@/types/category";

/**
 * Tipo de categoría adaptado para el CategoryNavbar
 */
export interface CategoryForNav {
  id: string;
  name: string;
  slug: string;
  children?: CategoryForNav[];
}

/**
 * Transforma las categorías del sistema al formato esperado por CategoryNavbar
 * Convierte la estructura de categorías y subcategorías en un árbol jerárquico
 */
export function transformCategoriesToNavFormat(): CategoryForNav[] {
  return categories.map((category) => ({
    id: category.code,
    name: category.shortName,
    slug: category.code,
    children: category.subcategories.map((subcategory) => ({
      id: subcategory.code,
      name: subcategory.shortName,
      slug: subcategory.code,
    })),
  }));
}

/**
 * Transforma las categorías de la API al formato esperado por CategoryNavbar
 * @param apiCategories - Categorías en formato árbol desde la API
 */
export function transformApiCategoriesToNavFormat(apiCategories: CategoryTree[]): CategoryForNav[] {
  return apiCategories.map((category) => ({
    id: category.code || String(category.id),
    name: category.short_name || category.name,
    slug: category.code || String(category.id),
    children: category.children
      ? transformApiCategoriesToNavFormat(category.children)
      : undefined,
  }));
}

/**
 * Obtiene todas las categorías formateadas para navegación (desde datos estáticos)
 */
export function getCategoriesForNav(): CategoryForNav[] {
  return transformCategoriesToNavFormat();
}
