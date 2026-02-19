import { useQuery } from '@tanstack/react-query';
import { brandService } from '@/services/brandService';
import type { Brand } from '@/types/product';

export const useBrands = (includeAll: boolean = false) => {
  return useQuery<Brand[], Error>({
    queryKey: ['brands', includeAll],
    queryFn: () => brandService.getAllBrands(includeAll),
  });
};

export const useBrandById = (id: number | null) => {
  return useQuery<Brand, Error>({
    queryKey: ['brand', id],
    queryFn: () => brandService.getBrandById(id!),
    enabled: !!id,
  });
};
