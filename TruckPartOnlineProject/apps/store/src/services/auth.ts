import type { LoginCredentials, LoginResponse, UserInfo, RegisterCredentials, RegisterResponse, VerifyEmailResponse } from '@/types/auth';
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

  // Actualizar perfil del usuario
  async updateProfile(data: Pick<UserInfo, 'full_name' | 'phone_number' | 'address'>): Promise<UserInfo> {
    try {
      const response = await apiClient.patch<UserInfo>(`${this.endpoint}/me/`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating profile:`, error);
      throw error;
    }
  }

  // Verificar email con token
  async verifyEmail(uid: string, token: string): Promise<VerifyEmailResponse> {
    try {
      const response = await apiClient.get<VerifyEmailResponse>(`${this.endpoint}/verify-email/${uid}/${token}/`);
      return response.data;
    } catch (error) {
      console.error(`Error verifying email:`, error);
      throw error;
    }
  }

  // Reenviar email de verificación
  async resendVerification(email: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<{ message: string }>(`${this.endpoint}/resend-verification/`, { email });
      return response.data;
    } catch (error) {
      console.error(`Error resending verification:`, error);
      throw error;
    }
  }

  // Verificar estado de cuenta
  async checkAccountStatus(email: string): Promise<{ exists: boolean; is_active: boolean; email?: string }> {
    try {
      const response = await apiClient.post<{ exists: boolean; is_active: boolean; email?: string }>(`${this.endpoint}/check-account-status/`, { email });
      return response.data;
    } catch (error) {
      console.error(`Error checking account status:`, error);
      throw error;
    }
  }
}

const authService = new AuthService();
export default authService;
