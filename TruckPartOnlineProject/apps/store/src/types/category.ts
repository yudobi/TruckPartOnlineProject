export interface Category {
  id: number;
  name: string;
  level: number;
  parent: number | null;
  qb_id: string | null;
  // Campos adicionales que pueden venir en algunas respuestas
  code?: string;
  short_name?: string;
  short_name_en?: string;
  description?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Para el endpoint /tree/ que retorna categorías con children anidados
export interface CategoryTree extends Category {
  children?: CategoryTree[];
}

export interface Subcategory {
  id: number;
  code?: string;
  name: string;
  short_name?: string;
  short_name_en?: string;
  description?: string;
  category: Category | number;
  category_code?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

// CategoryWithSubcategories usa la estructura de árbol del backend
export interface CategoryWithSubcategories extends Category {
  children?: CategoryWithSubcategories[];
  subcategories?: Subcategory[]; // Para compatibilidad con código existente
}

export interface CategoryFilters {
  is_active?: boolean;
  search?: string;
  page?: number;
  page_size?: number;
}

export interface SubcategoryFilters {
  category?: number | string;
  is_active?: boolean;
  search?: string;
  page?: number;
  page_size?: number;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
  page_size?: number;
  current_page?: number;
  total_pages?: number;
  has_next?: boolean;
  has_previous?: boolean;
}
