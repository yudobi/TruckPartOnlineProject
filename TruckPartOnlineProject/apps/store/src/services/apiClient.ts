import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { toast } from 'sonner';
import Cookies from 'js-cookie';

// Cargar variables de entorno de Vite
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '90000', 10);

const AUTH_COOKIE_NAME = 'auth_user_data';
const TOKEN_REFRESH_ENDPOINT = '/users/token/refresh/';

export interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: AxiosResponse['headers'];
  config: AxiosRequestConfig;
}

// Queue entry for requests that arrive while a token refresh is in progress
interface QueueEntry {
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}

// Module-level state to coordinate concurrent refresh attempts
let isRefreshing = false;
let failedQueue: QueueEntry[] = [];

function processQueue(error: Error | null, token: string | null): void {
  for (const entry of failedQueue) {
    if (error) {
      entry.reject(error);
    } else {
      entry.resolve(token as string);
    }
  }
  failedQueue = [];
}

function getStoredRefreshToken(): string | null {
  const cookie = Cookies.get(AUTH_COOKIE_NAME);
  if (!cookie) return null;
  try {
    const userData = JSON.parse(cookie) as { refreshToken?: string };
    return userData.refreshToken ?? null;
  } catch {
    return null;
  }
}

function updateStoredAccessToken(newAccessToken: string): void {
  const cookie = Cookies.get(AUTH_COOKIE_NAME);
  if (!cookie) return;
  try {
    const userData = JSON.parse(cookie) as Record<string, unknown>;
    const updated = { ...userData, accessToken: newAccessToken };
    Cookies.set(AUTH_COOKIE_NAME, JSON.stringify(updated), {
      expires: 7,
      secure: window.location.protocol === 'https:',
      sameSite: 'strict',
    });
  } catch {
    // If the cookie is unparseable, leave it untouched
  }
}

function clearAuthAndRedirect(): void {
  Cookies.remove(AUTH_COOKIE_NAME);
  window.location.replace('/auth');
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
      async (error) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean;
        };

        // --- 401 handling: attempt token refresh ---
        if (error.response?.status === 401 && !originalRequest._retry) {
          // Do not attempt to refresh when the refresh call itself returns 401
          if (originalRequest.url?.includes(TOKEN_REFRESH_ENDPOINT)) {
            clearAuthAndRedirect();
            return Promise.reject(error);
          }

          const refreshToken = getStoredRefreshToken();
          if (!refreshToken) {
            clearAuthAndRedirect();
            return Promise.reject(error);
          }

          // Queue incoming requests until the single refresh resolves
          if (isRefreshing) {
            return new Promise<AxiosResponse>((resolve, reject) => {
              failedQueue.push({
                resolve: (token: string) => {
                  originalRequest.headers['Authorization'] = `Bearer ${token}`;
                  resolve(this.client(originalRequest));
                },
                reject: (err: Error) => {
                  reject(err);
                },
              });
            });
          }

          isRefreshing = true;
          originalRequest._retry = true;

          try {
            const refreshResponse = await this.client.post<{ access: string }>(
              TOKEN_REFRESH_ENDPOINT,
              { refresh: refreshToken }
            );

            const newAccessToken = refreshResponse.data.access;

            updateStoredAccessToken(newAccessToken);
            this.client.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

            processQueue(null, newAccessToken);
            return this.client(originalRequest);
          } catch (refreshError) {
            const err =
              refreshError instanceof Error
                ? refreshError
                : new Error('Token refresh failed');
            processQueue(err, null);
            clearAuthAndRedirect();
            return Promise.reject(err);
          } finally {
            isRefreshing = false;
          }
        }

        // --- Non-401 error notifications ---
        if (error.response?.status >= 500) {
          toast.error('Error en el servidor. Por favor, inténtalo más tarde.');
        } else if (!error.response) {
          // Error de red: sin respuesta del servidor
          toast.error('Sin conexión. Verifica tu conexión a internet.');
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

  // Método genérico para peticiones PATCH
  public async patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.client.patch<T>(url, data, config);
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
