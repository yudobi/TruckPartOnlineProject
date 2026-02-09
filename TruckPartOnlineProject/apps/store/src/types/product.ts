export interface ProductImage {
  id: number;
  image: string;
  is_main: boolean;
}

export interface ProductInventory {
  id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  updated_at: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  sku: string | null;
  is_active: boolean;
  inventory: ProductInventory;
  images: ProductImage[];
  created_at: string;
  updated_at: string;
  category?: string; 
  manufacturer?: string; // Nuevo campo para filtros
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ProductFilters {
  category?: string;
  subcategory?: string;
  manufacturer?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}

export interface CartItem extends Omit<Product, 'price'> {
  price: number; // En el carrito lo manejamos como número para cálculos
  quantity: number;
  imageUrl?: string;
}
