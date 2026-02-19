import type { Brand } from '@/types/product';
import apiClient from './apiClient';

class BrandService {
  private endpoint = '/brands';

  // Obtener todas las marcas que tienen productos
  async getAllBrands(includeAll: boolean = false): Promise<Brand[]> {
    try {
      const params = new URLSearchParams();
      if (includeAll) {
        params.append('all', 'true');
      }
      const url = `${this.endpoint}/?${params.toString()}`;
      const response = await apiClient.get<Brand[]>(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching brands:', error);
      throw error;
    }
  }

  // Obtener una marca por ID
  async getBrandById(id: number): Promise<Brand> {
    try {
      const response = await apiClient.get<Brand>(`${this.endpoint}/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching brand with id ${id}:`, error);
      throw error;
    }
  }
}

export const brandService = new BrandService();
