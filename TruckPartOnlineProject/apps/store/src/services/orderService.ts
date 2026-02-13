import type { 
  Order, 
  OrderFilters, 
  CheckoutData, 
  CheckoutResponse,
  PayOrderData,
  PayOrderResponse,
  PaginatedResponse 
} from '@/types/order';
import apiClient from './apiClient';

class OrderService {
  private endpoint = '';

  // Obtener todas las órdenes del usuario autenticado
  async getMyOrders(filters?: OrderFilters): Promise<PaginatedResponse<Order>> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        for (const key in filters) {
          const value = filters[key as keyof OrderFilters];
          if (value !== undefined) {
            params.append(key, String(value));
          }
        }
      }
      // Endpoint: GET /api/my-orders/
      const url = `my-orders/?${params.toString()}`;
      const response = await apiClient.get<PaginatedResponse<Order>>(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  }

  // Obtener detalle de una orden
  async getOrderById(orderId: number): Promise<Order> {
    try {
      // Endpoint: GET /api/{order_id}/
      const response = await apiClient.get<Order>(`${this.endpoint}${orderId}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching order ${orderId}:`, error);
      throw error;
    }
  }

  // Crear checkout (crear orden)
  async checkout(data: CheckoutData): Promise<CheckoutResponse> {
    try {
      // Endpoint: POST /api/checkout/
      const response = await apiClient.post<CheckoutResponse>(`${this.endpoint}checkout/`, data);
      return response.data;
    } catch (error) {
      console.error('Error creating checkout:', error);
      throw error;
    }
  }

  // Pagar orden
  async payOrder(orderId: number, data: PayOrderData): Promise<PayOrderResponse> {
    try {
      // Endpoint: POST /api/{order_id}/pay/
      const response = await apiClient.post<PayOrderResponse>(`${this.endpoint}${orderId}/pay/`, data);
      return response.data;
    } catch (error) {
      console.error(`Error paying order ${orderId}:`, error);
      throw error;
    }
  }
}

export const orderService = new OrderService();
