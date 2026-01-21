import type { User } from "./auth";

// Tipos base para API
export interface ApiError {
  message: string;
  code?: string;
  field?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: ApiError[];
}

export interface PaginatedApiResponse<T = unknown> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface LoginCredentials {
  phone_number: string;
  password: string;
}

export interface AuthResponse {

  refresh?: string;
  access?: string;
  user: User;
}

export interface RegisterData {
  email?: string;
  password: string;
  name: string;
  last_name: string;
  home_address: string;
  phone_number: string;
}

// Tipos para navegación
export interface MenuItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  path?: string;
  children?: MenuItem[];
  permission?: string;
}

export interface BreadcrumbItem {
  title: string;
  path?: string;
}

// Tipos para configuración
export interface AppConfig {
  api: {
    baseUrl: string;
    timeout: number;
  };
  features: {
    enableAnalytics: boolean;
    enableNotifications: boolean;
    enableExport: boolean;
  };
  ui: {
    theme: 'light' | 'dark' | 'auto';
    language: 'es' | 'en';
    itemsPerPage: number;
  };
}