import { useEffect, useState } from "react";
import { useCart } from "@hooks/useCart";
import { useCheckout } from "@hooks/useCheckout";
import {
  CheckoutForm,
  type CheckoutFormData,
} from "@components/checkout/CheckoutForm";
import {
  PaymentMethodSelector,
  type PaymentMethod,
} from "@components/checkout/PaymentMethodSelector";
import { OrderSummary } from "@components/checkout/OrderSummary";
import { useNavigate, useLocation } from "react-router";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import type { PayOrderData, CheckoutData } from "@/types/order";

export default function CheckoutPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCart();
  const {
    createOrder,
    payOrder,
    checkoutData,
    setCheckoutData,
    paymentResponse,
    isLoading,
    error,
  } = useCheckout();

  const location = useLocation();

  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod>("card");

  // Si hay datos de checkout en el estado de navegación, establecerlos
  useEffect(() => {
    if (location.state?.checkoutData && !checkoutData) {
      setCheckoutData(location.state.checkoutData);
    }
  }, [location.state, checkoutData, setCheckoutData]);

  // Si el carrito está vacío y no hay orden creada, redirigir
  useEffect(() => {
    if (items.length === 0 && !checkoutData && !location.state?.checkoutData) {
      navigate("/products");
    }
  }, [items, checkoutData, navigate, location.state]);

  // Manejar éxito de pago
  useEffect(() => {
    if (
      paymentResponse &&
      (paymentResponse.status === "invoiced" ||
        paymentResponse.status === "completed")
    ) {
      clearCart();
      // Redirigir a confirmación o historial
      // navigate(`/orders/${paymentResponse.order_id}`);
      // O mostrar mensaje de éxito temporalmente
      alert("Pedido completado con éxito!");
      navigate("/orders"); // Asumiendo que existe esta ruta
    }
  }, [paymentResponse, clearCart, navigate]);

  if (items.length === 0 && !checkoutData) {
    return (
      <div className="min-h-screen bg-black pt-24 px-6 flex flex-col items-center justify-center">
        <ShoppingCart className="w-16 h-16 text-zinc-600 mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">
          {t("checkout.emptyCart", "Tu carrito está vacío")}
        </h1>
        <Button
          onClick={() => navigate("/products")}
          className="mt-4 bg-red-600 hover:bg-red-700 text-white"
        >
          {t("checkout.backToShop", "Volver a la tienda")}
        </Button>
      </div>
    );
  }

  const handleShippingSubmit = async (data: CheckoutFormData) => {
    try {
      const orderData: CheckoutData = {
        items: items.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
        })),
        shipping_address: data.shippingAddress,
        // Asumiendo que el backend espera city, state, etc. en el address o separados
        // El tipo CheckoutData tiene shipping_address, phone, payment_method opcionales.
        // Si el backend no soporta city/state separados, los concatenamos en shipping_address.
        // Pero el form los pide separados.
        // Voy a asumir concatenación para shipping_address por ahora si el tipo no los tiene.
        // El tipo CheckoutData en order.ts solo tiene shipping_address, pero el Order tiene city, state, etc.
        // Ajustaré para enviar lo que el backend espera.
      };

      // Enviar también datos extras si el backend lo soporta, o concatenar en shipping_address
      const fullAddress = `${data.shippingAddress}, ${data.city}, ${data.state}, ${data.postalCode}, ${data.country}`;
      // orderData.shipping_address = fullAddress; // Si el backend espera un string largo

      // NOTA: El tipo CheckoutData en order.ts es:
      /*
      export interface CheckoutData {
        items: { product_id: number; quantity: number }[];
        shipping_address?: string;
        phone?: string;
        payment_method?: PaymentMethod;
      }
      */

      // Modificaré orderData para que coincida con lo que el backend REALMENTE espera.
      // Si el backend es Django REST Framework y usa un serializador personalizado, podría aceptar más campos.
      // Por seguridad, enviaré shipping_address como concatenación por ahora.

      await createOrder({
        ...orderData,
        shipping_address: fullAddress,
      });

      // Si la respuesta es exitosa, pasamos al paso de pago automáticamente
    } catch (err) {
      console.error("Checkout failed", err);
    }
  };

  const handlePaymentSubmit = async () => {
    if (!checkoutData) return;

    try {
      const paymentData: PayOrderData = {
        payment_method: selectedPaymentMethod,
      };
      await payOrder(checkoutData.order_id, paymentData);
    } catch (err) {
      console.error("Payment failed", err);
    }
  };

  return (
    <div className="min-h-screen bg-black pt-24 pb-12 px-6">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-3xl font-black text-white mb-8 tracking-tighter">
          {checkoutData
            ? t("checkout.paymentTitle", "PAGO SEGURO")
            : t("checkout.title", "FINALIZAR COMPRA")}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-md">
                {error}
              </div>
            )}

            {!checkoutData ? (
              // Paso 1: Dirección
              <CheckoutForm
                onSubmit={handleShippingSubmit}
                isLoading={isLoading}
              />
            ) : (
              // Paso 2: Pago
              <PaymentMethodSelector
                selectedMethod={selectedPaymentMethod}
                onSelect={setSelectedPaymentMethod}
                onSubmit={handlePaymentSubmit}
                isLoading={isLoading}
              />
            )}
          </div>

          {/* Sidebar Summary */}
          <div className="lg:col-span-1">
            <OrderSummary
              items={items}
              total={checkoutData ? checkoutData.total : subtotal}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
