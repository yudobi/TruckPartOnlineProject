import { useQuery } from '@tanstack/react-query';
import { productService } from '../services/productService';
import { type Product, type ProductFilters } from '../types/product';

export const useProducts = (filters?: ProductFilters) => {
  return useQuery<Product[], Error>({
    queryKey: ['products', filters],
    queryFn: () => productService.getAllProducts(filters),
  });
};
