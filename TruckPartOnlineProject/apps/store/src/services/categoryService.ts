import type { 
  Category, 
  CategoryTree,
  Subcategory,  
  SubcategoryFilters,
  PaginatedResponse 
} from '@/types/category';
import apiClient from './apiClient';

class CategoryService {
  private endpoint = '/categories';
  private subcategoryEndpoint = '/subcategories';

  // Obtener todas las categorías (paginadas)
  async getAllCategories(): Promise<PaginatedResponse<Category>> {
    try {
      const url = `${this.endpoint}/tree}`;
      const response = await apiClient.get<PaginatedResponse<Category>>(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  // Obtener todas las categorías con sus subcategorías en formato árbol
  async getAllCategoriesWithSubcategories(): Promise<CategoryTree[]> {
    try {
      // Endpoint: GET /categories/tree/
      const response = await apiClient.get<CategoryTree[]>(`${this.endpoint}/tree/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching categories with subcategories:', error);
      throw error;
    }
  }

  // Obtener una categoría por ID
  async getCategoryById(id: number): Promise<Category> {
    try {
      const response = await apiClient.get<Category>(`${this.endpoint}/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching category with id ${id}:`, error);
      throw error;
    }
  }

  // Obtener una categoría por código
  async getCategoryByCode(code: string): Promise<Category> {
    try {
      const response = await apiClient.get<Category>(`${this.endpoint}/by-code/${code}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching category with code ${code}:`, error);
      throw error;
    }
  }

  // Obtener todas las subcategorías
  async getAllSubcategories(filters?: SubcategoryFilters): Promise<PaginatedResponse<Subcategory>> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        for (const key in filters) {
          const value = filters[key as keyof SubcategoryFilters];
          if (value !== undefined) {
            params.append(key, String(value));
          }
        }
      }
      const url = `${this.subcategoryEndpoint}/?${params.toString()}`;
      const response = await apiClient.get<PaginatedResponse<Subcategory>>(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      throw error;
    }
  }

  // Obtener subcategorías por categoría
  async getSubcategoriesByCategory(categoryId: number): Promise<Subcategory[]> {
    try {
      const response = await apiClient.get<Subcategory[]>(`${this.subcategoryEndpoint}/by-category/${categoryId}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching subcategories for category ${categoryId}:`, error);
      throw error;
    }
  }

  // Obtener una subcategoría por ID
  async getSubcategoryById(id: number): Promise<Subcategory> {
    try {
      const response = await apiClient.get<Subcategory>(`${this.subcategoryEndpoint}/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching subcategory with id ${id}:`, error);
      throw error;
    }
  }
}

export const categoryService = new CategoryService();
