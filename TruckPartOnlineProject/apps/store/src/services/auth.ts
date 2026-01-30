import type { UserLoginInfo } from '@/types/auth';
import apiClient from './apiClient';

class AuthService {
  private endpoint = '/users';

  // Obtener un producto por ID
  async getProductById(id: number): Promise<UserLoginInfo> {
    try {
      const response = await apiClient.get<UserLoginInfo>(`${this.endpoint}/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching product with id ${id}:`, error);
      throw error;
    }
  }
}

export default { AuthService }