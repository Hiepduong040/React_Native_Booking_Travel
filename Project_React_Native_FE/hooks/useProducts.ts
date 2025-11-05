// hooks/useProducts.ts
import { useQuery } from '@tanstack/react-query';
import { productService } from '../services/product';
import { Product } from '../types';

export const useProducts = () => {
  return useQuery<Product[], Error>({
    queryKey: ['products'],
    queryFn: productService.getAll,
    staleTime: 5 * 60 * 1000, // 5 phút
    cacheTime: 10 * 60 * 1000, // 10 phút
  });
};