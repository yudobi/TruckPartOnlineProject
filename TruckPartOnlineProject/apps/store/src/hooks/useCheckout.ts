import { useState } from "react";
import { orderService } from "../services/orderService";
import type {
  CheckoutData,
  CheckoutResponse,
  PayOrderData,
  PayOrderResponse,
} from "../types/order";

interface UseCheckoutState {
  isLoading: boolean;
  error: string | null;
  checkoutData: CheckoutResponse | null;
  paymentResponse: PayOrderResponse | null;
}

export function useCheckout() {
  const [state, setState] = useState<UseCheckoutState>({
    isLoading: false,
    error: null,
    checkoutData: null,
    paymentResponse: null,
  });

  const createOrder = async (data: CheckoutData) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await orderService.checkout(data);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        checkoutData: response,
      }));
      return response;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || "Error al crear la orden";
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw err;
    }
  };

  const payOrder = async (orderId: number, data: PayOrderData) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await orderService.payOrder(orderId, data);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        paymentResponse: response,
      }));
      return response;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || "Error al procesar el pago";
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw err;
    }
  };

  const resetState = () => {
    setState({
      isLoading: false,
      error: null,
      checkoutData: null,
      paymentResponse: null,
    });
  };

  return {
    ...state,
    createOrder,
    payOrder,
    resetState,
  };
}
