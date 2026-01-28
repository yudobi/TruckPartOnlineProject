import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';

// Cargar variables de entorno de Vite
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '10000', 10);

export interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: AxiosResponse['headers'];
  config: AxiosRequestConfig;
}

class ApiClient {
  private client: AxiosInstance;
  
  constructor(baseURL: string = API_BASE_URL) {
    this.client = axios.create({
      baseURL,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Interceptor para manejar errores globalmente
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        // Aquí puedes manejar errores globales, como redireccionar al login si el token expira
        if (error.response?.status === 401) {
          // Manejar error de autenticación
          console.error('Error de autenticación');
        }
        return Promise.reject(error);
      }
    );
  }

  // Método genérico para peticiones GET
  public async get<T = unknown>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.client.get<T>(url, config);
    return this.createResponse(response);
  }

  // Método genérico para peticiones POST
  public async post<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.client.post<T>(url, data, config);
    return this.createResponse(response);
  }

  // Método genérico para peticiones PUT
  public async put<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.client.put<T>(url, data, config);
    return this.createResponse(response);
  }

  // Método genérico para peticiones DELETE
  public async delete<T = unknown>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.client.delete<T>(url, config);
    return this.createResponse(response);
  }

  // Método para establecer el token de autenticación
  public setAuthToken(token: string | null): void {
    if (token) {
      this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.client.defaults.headers.common['Authorization'];
    }
  }

  // Método auxiliar para crear una respuesta estandarizada
  private createResponse<T>(response: AxiosResponse<T>): ApiResponse<T> {
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      config: response.config,
    };
  }
}

// Crear una instancia del cliente API con la URL base configurada en las variables de entorno
const apiClient = new ApiClient();

export default apiClient;
