import type {
  AdminOrderListItem,
  AdminOrderDetail,
  AdminOrderFilters,
  UpdateOrderStatusData,
  AdminPaginatedResponse,
} from '@/types/admin';
import apiClient from './apiClient';

class AdminOrderService {
  async getOrders(
    filters?: AdminOrderFilters
  ): Promise<AdminPaginatedResponse<AdminOrderListItem>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    const response = await apiClient.get<AdminPaginatedResponse<AdminOrderListItem>>(
      `admin/orders/?${params.toString()}`
    );
    return response.data;
  }

  async getOrderById(orderId: number): Promise<AdminOrderDetail> {
    const response = await apiClient.get<AdminOrderDetail>(
      `admin/orders/${orderId}/`
    );
    return response.data;
  }

  async updateOrderStatus(
    orderId: number,
    data: UpdateOrderStatusData
  ): Promise<{ id: number; status: string; payment_status: string; message: string }> {
    const response = await apiClient.patch<{
      id: number;
      status: string;
      payment_status: string;
      message: string;
    }>(`admin/orders/${orderId}/status/`, data);
    return response.data;
  }
}

export const adminOrderService = new AdminOrderService();
