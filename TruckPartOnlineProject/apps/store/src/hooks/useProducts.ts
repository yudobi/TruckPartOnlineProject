import { useQuery } from '@tanstack/react-query';
import { productService } from '../services/productService';
import { type Product, type PaginatedResponse } from '../types/product';

const PAGE_SIZE = 100; // max_page_size del backend

async function fetchAllProducts(): Promise<PaginatedResponse<Product>> {
  const firstPage = await productService.getAllProducts({ page: 1, page_size: PAGE_SIZE });

  if (!firstPage.next) return firstPage;

  const totalPages = Math.ceil(firstPage.count / PAGE_SIZE);
  const remainingPages = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, i) =>
      productService.getAllProducts({ page: i + 2, page_size: PAGE_SIZE })
    )
  );

  return {
    ...firstPage,
    results: [
      ...firstPage.results,
      ...remainingPages.flatMap((p) => p.results),
    ],
    next: null,
    previous: null,
  };
}

export const useProducts = () => {
  return useQuery<PaginatedResponse<Product>, Error>({
    queryKey: ['products', 'all'],
    queryFn: fetchAllProducts,
    staleTime: 5 * 60 * 1000,
  });
};
