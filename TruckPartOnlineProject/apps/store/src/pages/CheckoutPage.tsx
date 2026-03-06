import { useEffect, useState } from "react";
import { toast } from "sonner";
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
import { useNavigate } from "react-router";
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
    paymentResponse,
    isLoading,
    error,
  } = useCheckout();

  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod>("card");

  // Si el carrito está vacío y no hay orden creada, redirigir
  useEffect(() => {
    if (items.length === 0 && !checkoutData) {
      navigate("/products");
    }
  }, [items, checkoutData, navigate]);

  // Manejar éxito de pago
  useEffect(() => {
    if (
      paymentResponse &&
      (paymentResponse.status === "invoiced" ||
        paymentResponse.status === "completed")
    ) {
      clearCart();
      toast.success("¡Pedido completado con éxito!");
      navigate(`/orders/confirmation/${paymentResponse.order_id}`);
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
        full_name: data.fullName,
        shipping_address: data.shippingAddress,
        city: data.city,
        state: data.state,
        country: data.country,
        postal_code: data.postalCode,
        guest_email: data.guestEmail,
      };

      await createOrder(orderData);
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
