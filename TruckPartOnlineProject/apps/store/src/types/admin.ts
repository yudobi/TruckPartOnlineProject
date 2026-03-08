import type { OrderStatus, PaymentMethod, PaymentStatus, OrderItem } from './order';

export interface AdminOrderListItem {
  id: number;
  full_name: string | null;
  guest_email: string | null;
  user_email: string | null;
  status: OrderStatus;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  total: number;
  items_count: number;
  created_at: string;
  shipping_address: string | null;
  city: string | null;
  state: string | null;
}

export interface AdminOrderDetail {
  id: number;
  full_name: string | null;
  guest_email: string | null;
  phone: string | null;
  user: { id: number; email: string; username: string } | null;
  shipping_address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postal_code: string | null;
  status: OrderStatus;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  total: number;
  qb_invoice_id: string | null;
  qb_sales_receipt_id: string | null;
  qb_sales_id: string | null;
  items: OrderItem[];
  created_at: string;
}

export interface AdminOrderFilters {
  status?: OrderStatus;
  payment_status?: PaymentStatus;
  search?: string;
  page?: number;
  page_size?: number;
}

export interface UpdateOrderStatusData {
  status?: OrderStatus;
  payment_status?: PaymentStatus;
}

export interface AdminPaginatedResponse<T> {
  count: number;
  page: number;
  page_size: number;
  results: T[];
}
