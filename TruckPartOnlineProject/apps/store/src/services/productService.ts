import type { Product, ProductFilters } from '@/types/product';
import apiClient from './apiClient';


class ProductService {
  private endpoint = '/products';

  // Obtener todos los productos
  async getAllProducts(filters?: ProductFilters): Promise<Product[]> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        for (const key in filters) {
          const value = filters[key as keyof ProductFilters];
          if (value !== undefined) {
            params.append(key, String(value));
          }
        }
      }
      const url = `${this.endpoint}?${params.toString()}`;
      const response = await apiClient.get<{ data: Product[] }>(url);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  // Obtener un producto por ID
  async getProductById(id: number): Promise<Product> {
    try {
      const response = await apiClient.get<{ data: Product }>(`${this.endpoint}/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching product with id ${id}:`, error);
      throw error;
    }
  }

  // Crear un nuevo producto
  async createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    try {
      const response = await apiClient.post<{ data: Product }>(this.endpoint, productData);
      return response.data.data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  // Actualizar un producto existente
  async updateProduct(id: number, productData: Partial<Product>): Promise<Product> {
    try {
      const response = await apiClient.put<{ data: Product }>(`${this.endpoint}/${id}`, productData);
      return response.data.data;
    } catch (error) {
      console.error(`Error updating product with id ${id}:`, error);
      throw error;
    }
  }

  // Eliminar un producto
  async deleteProduct(id: number): Promise<void> {
    try {
      await apiClient.delete(`${this.endpoint}/${id}`);
    } catch (error) {
      console.error(`Error deleting product with id ${id}:`, error);
      throw error;
    }
  }
}

export const productService = new ProductService();
