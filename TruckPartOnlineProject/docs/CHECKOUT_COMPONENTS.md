# Documentación para Desarrollo de Componentes de Pedidos

## 1. Resumen del Proceso de Compra

El proceso de compra completo incluye:
1. **Ver carrito** - Mostrar productos seleccionados
2. **Finalizar compra (checkout)** - Crear el pedido
3. **Pagar pedido** - Procesar el pago
4. **Confirmación** - Mostrar resumen del pedido
5. **Mis pedidos** - Ver historial de pedidos

---

## 2. Endpoints de la API

### 2.1 Obtener Productos para Carrito

```
GET /api/order/products/
```

**Respuesta:**
```json
{
  "results": [
    {
      "id": 1,
      "name": "Filtro de Aceite Premium",
      "price": "45.99",
      "sku": "FA-001",
      "inventory": {
        "quantity": 50
      },
      "images": [
        { "id": 1, "image": "/media/products/filtro.jpg", "is_main": true }
      ]
    }
  ]
}
```

---

### 2.2 Crear Pedido (Checkout)

```
POST /api/checkout/
Headers: Authorization: Bearer <token>
Content-Type: application/json
```

**Request:**
```json
{
  "items": [
    { "product_id": 1, "quantity": 2 },
    { "product_id": 5, "quantity": 1 }
  ],
  "guest_email": "cliente@email.com"  // opcional
}
```

**Respuesta (201):**
```json
{
  "order_id": 123,
  "status": "pending",
  "total": "150.00"
}
```

---

### 2.3 Pagar Pedido

```
POST /api/<order_id>/pay/
Headers: Authorization: Bearer <token>
Content-Type: application/json
```

**Request:**
```json
{
  "payment_method": "cod"  // o "card"
}
```

**Respuesta (200):**
```json
{
  "order_id": 123,
  "status": "invoiced",
  "payment_status": "paid",
  "qb_invoice_id": "QB-INV-001"
}
```

---

### 2.4 Ver Detalle de un Pedido

```
GET /api/<order_id>/
Headers: Authorization: Bearer <token>
```

**Respuesta (200):**
```json
{
  "id": 123,
  "status": "completed",
  "payment_method": "cod",
  "payment_status": "paid",
  "total": "150.00",
  "shipping_address": "Calle 123",
  "country": "USA",
  "state": "Texas",
  "city": "Houston",
  "postal_code": "77001",
  "created_at": "2024-01-15T10:30:00Z",
  "items": [
    {
      "id": 1,
      "product": {
        "id": 1,
        "name": "Filtro de Aceite",
        "sku": "FA-001"
      },
      "quantity": 2,
      "price": "45.99"
    }
  ]
}
```

---

### 2.5 Ver Mis Pedidos

```
GET /api/my-orders/
Headers: Authorization: Bearer <token>
```

**Respuesta (200):**
```json
{
  "count": 5,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 123,
      "status": "completed",
      "payment_method": "card",
      "payment_status": "paid",
      "total": "150.00",
      "created_at": "2024-01-15T10:30:00Z",
      "items": [...]
    }
  ]
}
```

---

## 3. Tipos TypeScript

### 3.1 Tipos existentes en el proyecto

Located at: `apps/store/src/types/product.ts`

```typescript
export interface ProductImage {
  id: number;
  image: string;
  is_main: boolean;
}

export interface ProductInventory {
  id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  updated_at: string;
}

export interface ProductCategory {
  id: number;
  name: string;
  level: number;
  parent: number | null;
  qb_id: string | null;
}

export interface Brand {
  id: number;
  name: string;
  logo: string | null;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  sku: string | null;
  is_active: boolean;
  inventory: ProductInventory;
  images: ProductImage[];
  created_at: string;
  updated_at: string;
  category?: ProductCategory | string;
  brand?: Brand;
}
```

### 3.2 Nuevos tipos a crear

Crear archivo: `apps/store/src/types/order.ts`

```typescript
// Item del carrito
export interface CartItem {
  product: Product;
  quantity: number;
}

// Item en una orden (respuesta del servidor)
export interface OrderItem {
  id: number;
  product: {
    id: number;
    name: string;
    sku: string | null;
    images: ProductImage[];
  };
  quantity: number;
  price: string;
}

// Pedido completo
export interface Order {
  id: number;
  status: 'pending' | 'invoiced' | 'completed' | 'failed';
  payment_method: 'cod' | 'card';
  payment_status: 'pending' | 'paid' | 'failed';
  total: string;
  shipping_address?: string;
  country?: string;
  state?: string;
  city?: string;
  postal_code?: string;
  created_at: string;
  items: OrderItem[];
}

// Respuesta de checkout
export interface CheckoutResponse {
  order_id: number;
  status: string;
  total: string;
}

// Respuesta de pago
export interface PaymentResponse {
  order_id: number;
  status: string;
  payment_status: string;
  qb_invoice_id?: string;
}

// Request para crear checkout
export interface CheckoutRequest {
  items: Array<{
    product_id: number;
    quantity: number;
  }>;
  guest_email?: string;
}

// Request para pagar
export interface PaymentRequest {
  payment_method: 'cod' | 'card';
}

// Respuesta paginada de pedidos
export interface PaginatedOrders {
  count: number;
  next: string | null;
  previous: string | null;
  results: Order[];
}
```

---

## 4. Servicios a Crear

### 4.1 orderService.ts

Ubicación: `apps/store/src/services/orderService.ts`

```typescript
import apiClient from './apiClient';
import type { 
  Order, 
  CheckoutRequest, 
  CheckoutResponse, 
  PaymentRequest, 
  PaymentResponse,
  PaginatedOrders 
} from '@/types/order';

class OrderService {
  private endpoint = '/order';
  private checkoutEndpoint = '/checkout';

  // Obtener productos disponibles para comprar
  async getProducts(): Promise<any> {
    const response = await apiClient.get(`${this.endpoint}/products/`);
    return response.data;
  }

  // Crear un nuevo pedido (checkout)
  async createOrder(data: CheckoutRequest): Promise<CheckoutResponse> {
    const response = await apiClient.post(this.checkoutEndpoint, data);
    return response.data;
  }

  // Pagar un pedido existente
  async payOrder(orderId: number, data: PaymentRequest): Promise<PaymentResponse> {
    const response = await apiClient.post(`${this.endpoint}/${orderId}/pay/`, data);
    return response.data;
  }

  // Obtener detalle de un pedido
  async getOrder(orderId: number): Promise<Order> {
    const response = await apiClient.get(`${this.endpoint}/${orderId}/`);
    return response.data;
  }

  // Obtener pedidos del usuario
  async getMyOrders(): Promise<PaginatedOrders> {
    const response = await apiClient.get('/my-orders/');
    return response.data;
  }
}

export const orderService = new OrderService();
```

---

## 5. Hooks a Crear

### 5.1 useCart.ts (Gestión del carrito)

Ubicación: `apps/store/src/hooks/useCart.ts`

```typescript
import { useState, useEffect, useCallback } from 'react';
import type { CartItem, Product } from '@/types/order';

const CART_STORAGE_KEY = 'truck_parts_cart';

export const useCart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar carrito desde localStorage al iniciar
  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        console.error('Error parsing cart:', e);
      }
    }
    setIsLoading(false);
  }, []);

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    }
  }, [cartItems, isLoading]);

  // Agregar producto al carrito
  const addToCart = useCallback((product: Product, quantity: number = 1) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.product.id === product.id);
      
      if (existingItem) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      
      return [...prev, { product, quantity }];
    });
  }, []);

  // Remover producto del carrito
  const removeFromCart = useCallback((productId: number) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
  }, []);

  // Actualizar cantidad
  const updateQuantity = useCallback((productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCartItems(prev =>
      prev.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      )
    );
  }, [removeFromCart]);

  // Limpiar carrito
  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  // Calcular total
  const total = cartItems.reduce(
    (sum, item) => sum + parseFloat(item.product.price) * item.quantity,
    0
  );

  // Total de items
  const totalItems = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return {
    cartItems,
    isLoading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    total,
    totalItems,
  };
};
```

### 5.2 useCheckout.ts (Proceso de checkout)

Ubicación: `apps/store/src/hooks/useCheckout.ts`

```typescript
import { useState, useCallback } from 'react';
import { orderService } from '@/services/orderService';
import type { CheckoutRequest, PaymentRequest, CheckoutResponse, PaymentResponse } from '@/types/order';

interface CheckoutState {
  isLoading: boolean;
  error: string | null;
  checkoutData: CheckoutResponse | null;
  paymentData: PaymentResponse | null;
}

export const useCheckout = () => {
  const [state, setState] = useState<CheckoutState>({
    isLoading: false,
    error: null,
    checkoutData: null,
    paymentData: null,
  });

  // Crear pedido
  const createOrder = useCallback(async (items: Array<{ product_id: number; quantity: number }>, guestEmail?: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const checkoutData: CheckoutRequest = {
        items,
        ...(guestEmail && { guest_email: guestEmail }),
      };
      
      const response = await orderService.createOrder(checkoutData);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        checkoutData: response,
      }));
      
      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al crear el pedido';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, []);

  // Pagar pedido
  const payOrder = useCallback(async (orderId: number, paymentMethod: 'cod' | 'card') => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const paymentData: PaymentRequest = {
        payment_method: paymentMethod,
      };
      
      const response = await orderService.payOrder(orderId, paymentData);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        paymentData: response,
      }));
      
      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al procesar el pago';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, []);

  // Resetear estado
  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      checkoutData: null,
      paymentData: null,
    });
  }, []);

  return {
    ...state,
    createOrder,
    payOrder,
    reset,
  };
};
```

---

## 6. Componentes a Crear

### 6.1 Estructura de archivos

```
apps/store/src/components/
├── cart/
│   ├── CartItem.tsx          # Item individual del carrito
│   ├── CartSummary.tsx       # Resumen de compra (total, impuestos)
│   └── CartList.tsx          # Lista de items del carrito
├── checkout/
│   ├── CheckoutForm.tsx      # Formulario de datos de envío
│   ├── PaymentMethod.tsx      # Selección de método de pago
│   └── CheckoutButton.tsx     # Botón de finalizar compra
└── orders/
    ├── OrderCard.tsx          # Card de pedido en historial
    ├── OrderDetail.tsx        # Detalle de un pedido
    └── OrderStatus.tsx        # Badge de estado del pedido
```

### 6.2 CartItem.tsx

```typescript
import React from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import type { CartItem } from '@/types/order';

interface CartItemProps {
  item: CartItem;
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onRemove: (productId: number) => void;
}

export const CartItem: React.FC<CartItemProps> = ({
  item,
  onUpdateQuantity,
  onRemove,
}) => {
  const { product, quantity } = item;
  const imageUrl = product.images?.find(img => img.is_main)?.image || product.images?.[0]?.image;
  const price = parseFloat(product.price);
  const subtotal = price * quantity;

  return (
    <div className="flex gap-4 p-4 bg-zinc-900 rounded-lg">
      {/* Imagen */}
      <div className="w-20 h-20 bg-zinc-800 rounded flex items-center justify-center">
        {imageUrl ? (
          <img src={imageUrl} alt={product.name} className="w-full h-full object-cover rounded" />
        ) : (
          <Package className="w-8 h-8 text-zinc-600" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1">
        <h3 className="font-bold text-white">{product.name}</h3>
        <p className="text-zinc-400 text-sm">SKU: {product.sku}</p>
        <p className="text-red-500 font-bold">${price.toFixed(2)}</p>
      </div>

      {/* Cantidad */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onUpdateQuantity(product.id, quantity - 1)}
          className="p-1 bg-zinc-800 rounded hover:bg-zinc-700"
        >
          <Minus className="w-4 h-4 text-white" />
        </button>
        <span className="text-white font-bold w-8 text-center">{quantity}</span>
        <button
          onClick={() => onUpdateQuantity(product.id, quantity + 1)}
          className="p-1 bg-zinc-800 rounded hover:bg-zinc-700"
        >
          <Plus className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Subtotal */}
      <div className="text-right">
        <p className="text-white font-bold">${subtotal.toFixed(2)}</p>
        <button
          onClick={() => onRemove(product.id)}
          className="text-zinc-500 hover:text-red-500"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
```

### 6.3 CartList.tsx

```typescript
import React from 'react';
import { ShoppingCart, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router';
import { CartItem } from './CartItem';
import { CartSummary } from './CartSummary';
import type { CartItem as CartItemType } from '@/types/order';

interface CartListProps {
  items: CartItemType[];
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onRemove: (productId: number) => void;
  total: number;
}

export const CartList: React.FC<CartListProps> = ({
  items,
  onUpdateQuantity,
  onRemove,
  total,
}) => {
  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <ShoppingCart className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Tu carrito está vacío</h2>
        <p className="text-zinc-400 mb-4">Agrega productos para comenzar</p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Ver productos
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Lista de items */}
      <div className="lg:col-span-2 space-y-4">
        {items.map(item => (
          <CartItem
            key={item.product.id}
            item={item}
            onUpdateQuantity={onUpdateQuantity}
            onRemove={onRemove}
          />
        ))}
      </div>

      {/* Resumen */}
      <div className="lg:col-span-1">
        <CartSummary total={total} />
      </div>
    </div>
  );
};
```

### 6.4 CheckoutForm.tsx

```typescript
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface CheckoutFormProps {
  onSubmit: (data: CheckoutFormData) => void;
  isLoading?: boolean;
}

interface CheckoutFormData {
  guestEmail?: string;
  shippingAddress: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export const CheckoutForm: React.FC<CheckoutFormProps> = ({ onSubmit, isLoading }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<CheckoutFormData>({
    shippingAddress: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Email para invitados */}
      <div>
        <label className="block text-sm font-medium text-zinc-400 mb-2">
          {t('checkout.email')} (opcional)
        </label>
        <input
          type="email"
          name="guestEmail"
          value={formData.guestEmail || ''}
          onChange={handleChange}
          className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2 text-white"
          placeholder="tu@email.com"
        />
      </div>

      {/* Dirección de envío */}
      <div>
        <label className="block text-sm font-medium text-zinc-400 mb-2">
          {t('checkout.shippingAddress')}
        </label>
        <input
          type="text"
          name="shippingAddress"
          value={formData.shippingAddress}
          onChange={handleChange}
          required
          className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2 text-white"
          placeholder={t('checkout.addressPlaceholder')}
        />
      </div>

      {/* Ciudad y Estado */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">
            {t('checkout.city')}
          </label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            required
            className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2 text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">
            {t('checkout.state')}
          </label>
          <input
            type="text"
            name="state"
            value={formData.state}
            onChange={handleChange}
            required
            className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2 text-white"
          />
        </div>
      </div>

      {/* País y Código Postal */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">
            {t('checkout.country')}
          </label>
          <input
            type="text"
            name="country"
            value={formData.country}
            onChange={handleChange}
            required
            className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2 text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">
            {t('checkout.postalCode')}
          </label>
          <input
            type="text"
            name="postalCode"
            value={formData.postalCode}
            onChange={handleChange}
            required
            className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2 text-white"
          />
        </div>
      </div>
    </form>
  );
};
```

### 6.5 PaymentMethod.tsx

```typescript
import React from 'react';
import { useTranslation } from 'react-i18next';
import { CreditCard, Banknote } from 'lucide-react';

interface PaymentMethodProps {
  selected: 'cod' | 'card';
  onChange: (method: 'cod' | 'card') => void;
}

export const PaymentMethod: React.FC<PaymentMethodProps> = ({ selected, onChange }) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-white">{t('checkout.paymentMethod')}</h3>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Contraentrega */}
        <button
          type="button"
          onClick={() => onChange('cod')}
          className={`
            p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-all
            ${selected === 'cod' 
              ? 'border-red-600 bg-red-600/10' 
              : 'border-zinc-700 bg-zinc-800 hover:border-zinc-600'
            }
          `}
        >
          <Banknote className={`w-8 h-8 ${selected === 'cod' ? 'text-red-500' : 'text-zinc-400'}`} />
          <span className={`font-medium ${selected === 'cod' ? 'text-white' : 'text-zinc-400'}`}>
            {t('checkout.cod')}
          </span>
        </button>

        {/* Tarjeta */}
        <button
          type="button"
          onClick={() => onChange('card')}
          className={`
            p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-all
            ${selected === 'card' 
              ? 'border-red-600 bg-red-600/10' 
              : 'border-zinc-700 bg-zinc-800 hover:border-zinc-600'
            }
          `}
        >
          <CreditCard className={`w-8 h-8 ${selected === 'card' ? 'text-red-500' : 'text-zinc-400'}`} />
          <span className={`font-medium ${selected === 'card' ? 'text-white' : 'text-zinc-400'}`}>
            {t('checkout.card')}
          </span>
        </button>
      </div>
    </div>
  );
};
```

### 6.6 OrderCard.tsx

```typescript
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { ChevronRight, Package } from 'lucide-react';
import type { Order } from '@/types/order';
import { OrderStatus } from './OrderStatus';

interface OrderCardProps {
  order: Order;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  const { t } = useTranslation();

  return (
    <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-white">
            {t('orders.order')} #{order.id}
          </h3>
          <p className="text-zinc-400 text-sm">
            {new Date(order.created_at).toLocaleDateString()}
          </p>
        </div>
        <OrderStatus status={order.status} paymentStatus={order.payment_status} />
      </div>

      <div className="flex justify-between items-center">
        <div>
          <p className="text-zinc-400 text-sm">{order.items.length} {t('orders.items')}</p>
          <p className="text-xl font-bold text-white">${order.total}</p>
        </div>
        
        <Link
          to={`/orders/${order.id}`}
          className="flex items-center gap-1 text-red-500 hover:text-red-400"
        >
          {t('orders.viewDetails')}
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
```

### 6.7 OrderStatus.tsx

```typescript
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface OrderStatusProps {
  status: 'pending' | 'invoiced' | 'completed' | 'failed';
  paymentStatus: 'pending' | 'paid' | 'failed';
}

export const OrderStatus: React.FC<OrderStatusProps> = ({ status, paymentStatus }) => {
  const { t } = useTranslation();

  const getStatusConfig = () => {
    switch (paymentStatus) {
      case 'paid':
        return { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10', label: t('orders.paid') };
      case 'failed':
        return { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10', label: t('orders.failed') };
      default:
        return { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/10', label: t('orders.pending') };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${config.bg}`}>
      <Icon className={`w-4 h-4 ${config.color}`} />
      <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
    </div>
  );
};
```

---

## 7. Página de Carrito

### 7.1 CartPage.tsx

```typescript
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useCart } from '@/hooks/useCart';
import { CartList } from '@/components/cart/CartList';
import { Link } from 'react-router';

export const CartPage: React.FC = () => {
  const { t } = useTranslation();
  const {
    cartItems,
    isLoading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    total,
  } = useCart();

  if (isLoading) {
    return <div className="text-center py-16">{t('common.loading')}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-8">{t('cart.title')}</h1>
      
      <CartList
        items={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
        total={total}
      />

      {cartItems.length > 0 && (
        <div className="mt-8 flex justify-end">
          <Link
            to="/checkout"
            className="bg-red-600 text-white px-8 py-3 rounded font-bold hover:bg-red-700"
          >
            {t('cart.proceedToCheckout')}
          </Link>
        </div>
      )}
    </div>
  );
};
```

---

## 8. Página de Checkout

### 8.1 CheckoutPage.tsx

```typescript
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useCart } from '@/hooks/useCart';
import { useCheckout } from '@/hooks/useCheckout';
import { CheckoutForm } from '@/components/checkout/CheckoutForm';
import { PaymentMethod } from '@/components/checkout/PaymentMethod';
import { CartSummary } from '@/components/cart/CartSummary';

export const CheckoutPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { cartItems, clearCart, total } = useCart();
  const { createOrder, payOrder, isLoading, error } = useCheckout();
  
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card'>('cod');
  const [step, setStep] = useState<'form' | 'payment' | 'confirmation'>('form');

  const handleCheckoutSubmit = async (formData: any) => {
    try {
      // 1. Crear el pedido
      const items = cartItems.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity,
      }));
      
      const checkoutResult = await createOrder(items, formData.guestEmail);
      
      // 2. Ir al paso de pago
      setStep('payment');
      
      // 3. Procesar el pago
      const paymentResult = await payOrder(checkoutResult.order_id, paymentMethod);
      
      // 4. Limpiar carrito y mostrar confirmación
      clearCart();
      setStep('confirmation');
      
      // 5. Redireccionar a página de confirmación o mis pedidos
      navigate(`/orders/${checkoutResult.order_id}`);
      
    } catch (err) {
      console.error('Checkout error:', err);
    }
  };

  if (cartItems.length === 0 && step !== 'confirmation') {
    navigate('/cart');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-8">{t('checkout.title')}</h1>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulario */}
        <div className="lg:col-span-2 space-y-8">
          {step === 'form' && (
            <>
              <CheckoutForm onSubmit={handleCheckoutSubmit} isLoading={isLoading} />
              <PaymentMethod selected={paymentMethod} onChange={setPaymentMethod} />
            </>
          )}
          
          {step === 'payment' && (
            <div className="text-center py-8">
              <p className="text-white">{t('checkout.processingPayment')}</p>
            </div>
          )}
        </div>

        {/* Resumen */}
        <div className="lg:col-span-1">
          <CartSummary total={total} />
        </div>
      </div>
    </div>
  );
};
```

---

## 9. Página de Mis Pedidos

### 9.1 OrdersPage.tsx

```typescript
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { orderService } from '@/services/orderService';
import { OrderCard } from '@/components/orders/OrderCard';
import { Package } from 'lucide-react';

export const OrdersPage: React.FC = () => {
  const { t } = useTranslation();
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['orders'],
    queryFn: () => orderService.getMyOrders(),
  });

  if (isLoading) {
    return <div className="text-center py-16">{t('common.loading')}</div>;
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-red-500">{t('orders.error')}</p>
      </div>
    );
  }

  if (!data?.results?.length) {
    return (
      <div className="text-center py-16">
        <Package className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">{t('orders.empty')}</h2>
        <p className="text-zinc-400">{t('orders.emptyDesc')}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-8">{t('orders.title')}</h1>
      
      <div className="space-y-4">
        {data.results.map(order => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
    </div>
  );
};
```

---

## 10. Traducciones

### 10.1 es.json

```json
{
  "cart": {
    "title": "Carrito de Compras",
    "empty": "Tu carrito está vacío",
    "emptyDesc": "Agrega productos para comenzar",
    "proceedToCheckout": "Finalizar Compra",
    "clearCart": "Vaciar Carrito",
    "items": "artículos",
    "subtotal": "Subtotal",
    "total": "Total"
  },
  "checkout": {
    "title": "Finalizar Compra",
    "email": "Correo electrónico",
    "shippingAddress": "Dirección de envío",
    "addressPlaceholder": "Calle, número, colonia",
    "city": "Ciudad",
    "state": "Estado/Provincia",
    "country": "País",
    "postalCode": "Código Postal",
    "paymentMethod": "Método de pago",
    "cod": "Contraentrega",
    "card": "Tarjeta de crédito/débito",
    "processingPayment": "Procesando pago...",
    "placeOrder": "Realizar Pedido",
    "orderPlaced": "¡Pedido realizado con éxito!",
    "orderNumber": "Número de pedido"
  },
  "orders": {
    "title": "Mis Pedidos",
    "empty": "No tienes pedidos aún",
    "emptyDesc": "Realiza tu primer pedido para verlo aquí",
    "order": "Pedido",
    "items": "artículos",
    "viewDetails": "Ver detalles",
    "paid": "Pagado",
    "pending": "Pendiente",
    "failed": "Fallido",
    "completed": "Completado",
    "error": "Error al cargar pedidos"
  },
  "common": {
    "loading": "Cargando...",
    "error": "Ocurrió un error"
  }
}
```

### 10.2 en.json

```json
{
  "cart": {
    "title": "Shopping Cart",
    "empty": "Your cart is empty",
    "emptyDesc": "Add products to get started",
    "proceedToCheckout": "Proceed to Checkout",
    "clearCart": "Clear Cart",
    "items": "items",
    "subtotal": "Subtotal",
    "total": "Total"
  },
  "checkout": {
    "title": "Checkout",
    "email": "Email",
    "shippingAddress": "Shipping Address",
    "addressPlaceholder": "Street, number, neighborhood",
    "city": "City",
    "state": "State/Province",
    "country": "Country",
    "postalCode": "Postal Code",
    "paymentMethod": "Payment Method",
    "cod": "Cash on Delivery",
    "card": "Credit/Debit Card",
    "processingPayment": "Processing payment...",
    "placeOrder": "Place Order",
    "orderPlaced": "Order placed successfully!",
    "orderNumber": "Order number"
  },
  "orders": {
    "title": "My Orders",
    "empty": "You have no orders yet",
    "emptyDesc": "Place your first order to see it here",
    "order": "Order",
    "items": "items",
    "viewDetails": "View details",
    "paid": "Paid",
    "pending": "Pending",
    "failed": "Failed",
    "completed": "Completed",
    "error": "Error loading orders"
  },
  "common": {
    "loading": "Loading...",
    "error": "An error occurred"
  }
}
```

---

## 11. Rutas

Agregar al archivo de rutas principal (App.tsx o Router.tsx):

```typescript
import { CartPage } from '@/pages/CartPage';
import { CheckoutPage } from '@/pages/CheckoutPage';
import { OrdersPage } from '@/pages/OrdersPage';
import { OrderDetailPage } from '@/pages/OrderDetailPage';

// ...
<Route path="/cart" element={<CartPage />} />
<Route path="/checkout" element={<CheckoutPage />} />
<Route path="/orders" element={<OrdersPage />} />
<Route path="/orders/:orderId" element={<OrderDetailPage />} />
```

---

## 12. Notas Importantes

1. **Autenticación**: Los endpoints de pedidos requieren token JWT en el header `Authorization: Bearer <token>`

2. **Carrito**: Se guarda en localStorage para persistencia entre sesiones

3. **Stock**: El backend valida el stock antes de crear el pedido. Si no hay stock suficiente, retorna error

4. **Payment Methods**:
   - `cod`: Cash on Delivery (contraentrega)
   - `card`: Tarjeta de crédito/débito

5. **Estados del pedido**:
   - `pending`: Esperando pago
   - `invoiced`: Facturado
   - `completed`: Completado
   - `failed`: Fallido

6. **Campos opcionales del pedido**: El email solo es requerido para usuarios no autenticados (invitados)

---

## 13. Servicios Existentes a Consultar

- `apps/store/src/services/apiClient.ts` - Cliente HTTP con interceptores
- `apps/store/src/hooks/useAuth.ts` - Manejo de autenticación (si existe)
- `apps/store/src/pages/ProductsPage.tsx` -参考现有的页面结构
