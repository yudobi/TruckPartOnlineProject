import type { LoginCredentials, LoginResponse, UserInfo, RegisterCredentials, RegisterResponse } from '@/types/auth';
import apiClient from './apiClient';

class AuthService {
  private endpoint = '/users';

  // Login
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>(`${this.endpoint}/login/`, credentials);
      return response.data;
    } catch (error) {
      console.error(`Error fetching login`, error);
      throw error;
    }
  }

  // Register
  async register(credentials: RegisterCredentials): Promise<RegisterResponse> {
    try {
      const response = await apiClient.post<RegisterResponse>(`${this.endpoint}/register/`, credentials);
      return response.data;
    } catch (error) {
      console.error(`Error fetching register`, error);
      throw error;
    }
  }
  
  // Obtener informacion del usuario
  async userInfo(): Promise<UserInfo> {
    try {
      const response = await apiClient.get<UserInfo>(`${this.endpoint}/me/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching userinfo:`, error);
      throw error;
    }
  }
}

const authService = new AuthService();
export default authService;
