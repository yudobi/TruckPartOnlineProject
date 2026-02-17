import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService } from '../services/orderService';
import { 
  type Order, 
  type OrderFilters,
  type CheckoutData,
  type CheckoutResponse,
  type PayOrderData,
  type PayOrderResponse,
} from '../types/order';
import type { PaginatedResponse } from '@/types/product';

// Hook para obtener las órdenes del usuario
export const useMyOrders = (filters?: OrderFilters) => {
  return useQuery<PaginatedResponse<Order>, Error>({
    queryKey: ['orders', 'my-orders', filters],
    queryFn: () => orderService.getMyOrders(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
};

// Hook para obtener una orden por ID
export const useOrderById = (orderId: number | null) => {
  return useQuery<Order, Error>({
    queryKey: ['order', orderId],
    queryFn: () => orderService.getOrderById(orderId!),
    enabled: !!orderId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Hook para crear checkout
export const useCheckout = () => {
  const queryClient = useQueryClient();
  
  return useMutation<CheckoutResponse, Error, CheckoutData>({
    mutationFn: (data: CheckoutData) => orderService.checkout(data),
    onSuccess: () => {
      // Invalidar cache de órdenes después de crear una nueva
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

// Hook para pagar orden
export const usePayOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation<PayOrderResponse, Error, { orderId: number; data: PayOrderData }>({
    mutationFn: ({ orderId, data }) => orderService.payOrder(orderId, data),
    onSuccess: (_, variables) => {
      // Invalidar cache de la orden específica
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};
