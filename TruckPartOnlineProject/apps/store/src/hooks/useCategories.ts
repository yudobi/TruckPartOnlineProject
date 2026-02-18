import { useQuery } from '@tanstack/react-query';
import { categoryService } from '../services/categoryService';
import { 
  type Category, 
  type CategoryTree,
  type Subcategory, 
  type CategoryFilters, 
  type SubcategoryFilters,
  type PaginatedResponse 
} from '../types/category';

// Hook para obtener todas las categorías
export const useCategories = (filters?: CategoryFilters) => {
  return useQuery<PaginatedResponse<Category>, Error>({
    queryKey: ['categories', filters],
    queryFn: () => categoryService.getAllCategories(),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
};

// Hook para obtener categorías con subcategorías (estructura de árbol)
export const useCategoriesWithSubcategories = () => {
  return useQuery<CategoryTree[], Error>({
    queryKey: ['categories', 'tree'],
    queryFn: () => categoryService.getAllCategoriesWithSubcategories(),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
};

// Hook para obtener una categoría por ID
export const useCategoryById = (id: number | null) => {
  return useQuery<Category, Error>({
    queryKey: ['category', id],
    queryFn: () => categoryService.getCategoryById(id!),
    enabled: !!id, // Solo se ejecuta si hay un ID
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Hook para obtener una categoría por código
export const useCategoryByCode = (code: string | null) => {
  return useQuery<Category, Error>({
    queryKey: ['category', 'code', code],
    queryFn: () => categoryService.getCategoryByCode(code!),
    enabled: !!code, // Solo se ejecuta si hay un código
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Hook para obtener todas las subcategorías
export const useSubcategories = (filters?: SubcategoryFilters) => {
  return useQuery<PaginatedResponse<Subcategory>, Error>({
    queryKey: ['subcategories', filters],
    queryFn: () => categoryService.getAllSubcategories(filters),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Hook para obtener subcategorías por categoría
export const useSubcategoriesByCategory = (categoryId: number | null) => {
  return useQuery<Subcategory[], Error>({
    queryKey: ['subcategories', 'by-category', categoryId],
    queryFn: () => categoryService.getSubcategoriesByCategory(categoryId!),
    enabled: !!categoryId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Hook para obtener una subcategoría por ID
export const useSubcategoryById = (id: number | null) => {
  return useQuery<Subcategory, Error>({
    queryKey: ['subcategory', id],
    queryFn: () => categoryService.getSubcategoryById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
