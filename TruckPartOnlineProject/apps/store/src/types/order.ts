export interface OrderItem {
  id: number;
  product: {
    id: number;
    name: string;
    sku?: string;
    images?: { id: number; image: string; is_main: boolean }[];
  };
  quantity: number;
  price: string;
}

export type OrderStatus = 'pending' | 'invoiced' | 'completed' | 'failed';
export type PaymentMethod = 'cod' | 'card';
export type PaymentStatus = 'pending' | 'paid' | 'failed';

export interface Order {
  id: number;
  user?: {
    id: number;
    username: string;
    email: string;
  };
  guest_email?: string | null;
  phone?: string | null;
  shipping_address?: string | null;
  country?: string | null;
  state?: string | null;
  city?: string | null;
  postal_code?: string | null;
  created_at: string;
  status: OrderStatus;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  total: string;
  qb_invoice_id?: string | null;
  qb_sales_receipt_id?: string | null;
  items: OrderItem[];
}

export interface OrderFilters {
  status?: OrderStatus;
  payment_status?: PaymentStatus;
  page?: number;
  page_size?: number;
}

export interface CheckoutData {
  items: {
    product_id: number;
    quantity: number;
  }[];
  shipping_address?: string;
  phone?: string;
  payment_method?: PaymentMethod;
}

export interface CheckoutResponse {
  order_id: number;
  status: OrderStatus;
  total: number;
}

export interface PayOrderData {
  payment_method: PaymentMethod;
}

export interface PayOrderResponse {
  order_id: number;
  status: OrderStatus;
  qb_sales_id?: string;
}
