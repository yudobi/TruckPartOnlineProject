import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { productService } from '../services/productService';
import { type ProductFilters, type Product, type PaginatedResponse } from '../types/product';

export const useProducts = (filters: ProductFilters = {}) => {
  return useQuery<PaginatedResponse<Product>, Error>({
    queryKey: ['products', filters],
    queryFn: () => productService.getAllProducts(filters),
    placeholderData: keepPreviousData,
    staleTime: 2 * 60 * 1000,
  });
};
