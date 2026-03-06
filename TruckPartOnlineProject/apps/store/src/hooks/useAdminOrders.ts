import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminOrderService } from '../services/adminOrderService';
import type {
  AdminOrderFilters,
  UpdateOrderStatusData,
} from '../types/admin';

// Hook para listar todas las órdenes (admin)
export const useAdminOrders = (filters?: AdminOrderFilters) => {
  return useQuery({
    queryKey: ['admin', 'orders', filters],
    queryFn: () => adminOrderService.getOrders(filters),
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000,
  });
};

// Hook para obtener el detalle de una orden (admin)
export const useAdminOrderById = (id: number | null) => {
  return useQuery({
    queryKey: ['admin', 'order', id],
    queryFn: () => adminOrderService.getOrderById(id!),
    enabled: id !== null && id > 0,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

// Hook para actualizar el estado de una orden (admin)
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation<
    { id: number; status: string; payment_status: string; message: string },
    Error,
    { orderId: number; data: UpdateOrderStatusData }
  >({
    mutationFn: ({ orderId, data }) =>
      adminOrderService.updateOrderStatus(orderId, data),
    onSuccess: (result) => {
      // Invalidar el detalle de la orden actualizada
      queryClient.invalidateQueries({ queryKey: ['admin', 'order', result.id] });
      // Invalidar el listado de órdenes para reflejar el cambio
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
    },
  });
};
