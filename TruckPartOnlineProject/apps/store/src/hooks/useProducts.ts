import { useQuery } from '@tanstack/react-query';
import { productService } from '../services/productService';
import { type Product, type PaginatedResponse } from '../types/product';

export const useProducts = () => {
  return useQuery<PaginatedResponse<Product>, Error>({
    queryKey: ['products'],
    queryFn: () => productService.getAllProducts(),
  });
};
