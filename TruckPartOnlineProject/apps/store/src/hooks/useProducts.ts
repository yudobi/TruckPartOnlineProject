import { useQuery } from '@tanstack/react-query';
import { productService } from '../services/productService';
import { type Product, type ProductFilters, type PaginatedResponse } from '../types/product';

export const useProducts = (filters?: ProductFilters) => {
  return useQuery<PaginatedResponse<Product>, Error>({
    queryKey: ['products', filters],
    queryFn: () => productService.getAllProducts(filters),
  });
};
