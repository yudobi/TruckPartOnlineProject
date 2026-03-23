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
import { StripeProvider } from "@components/checkout/StripeProvider";
import { CardPaymentForm } from "@components/checkout/CardPaymentForm";
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

  // Redirect to products if cart is empty and no order has been created
  useEffect(() => {
    if (items.length === 0 && !checkoutData) {
      navigate("/products");
    }
  }, [items, checkoutData, navigate]);

  // Handle successful COD payment response
  useEffect(() => {
    if (
      paymentResponse &&
      (paymentResponse.status === "invoiced" ||
        paymentResponse.status === "completed")
    ) {
      clearCart();
      toast.success(t("checkout.orderSuccess"));
      navigate(`/orders/confirmation/${paymentResponse.order_id}`);
    }
  }, [paymentResponse, clearCart, navigate, t]);

  if (items.length === 0 && !checkoutData) {
    return (
      <div className="min-h-screen bg-black pt-24 px-6 flex flex-col items-center justify-center">
        <ShoppingCart className="w-16 h-16 text-zinc-600 mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">
          {t("checkout.emptyCart")}
        </h1>
        <Button
          onClick={() => navigate("/products")}
          className="mt-4 bg-red-600 hover:bg-red-700 text-white"
        >
          {t("checkout.backToShop")}
        </Button>
      </div>
    );
  }

  // Step 1: Shipping info + payment method selection → creates the order
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
        payment_method: selectedPaymentMethod,
      };

      await createOrder(orderData);
    } catch (err) {
      console.error("Checkout failed", err);
    }
  };

  // Step 2b: COD — call payOrder manually
  const handleCodPayment = async () => {
    if (!checkoutData) return;

    try {
      const paymentData: PayOrderData = {
        payment_method: "cod",
      };
      await payOrder(checkoutData.order_id, paymentData);
    } catch (err) {
      console.error("COD payment failed", err);
    }
  };

  const isCardPayment = checkoutData?.client_secret != null;

  return (
    <div className="min-h-screen bg-black pt-24 pb-12 px-6">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-3xl font-black text-white mb-8 tracking-tighter">
          {checkoutData
            ? t("checkout.paymentTitle")
            : t("checkout.title")}
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
              // Step 1: Shipping information + payment method selection
              <CheckoutForm
                onSubmit={handleShippingSubmit}
                isLoading={isLoading}
                paymentMethodSelector={
                  <PaymentMethodSelector
                    selectedMethod={selectedPaymentMethod}
                    onSelect={setSelectedPaymentMethod}
                  />
                }
              />
            ) : isCardPayment ? (
              // Step 2a: Card payment via Stripe
              <StripeProvider clientSecret={checkoutData.client_secret!}>
                <CardPaymentForm
                  orderId={checkoutData.order_id}
                  isLoading={isLoading}
                />
              </StripeProvider>
            ) : (
              // Step 2b: Cash on delivery confirmation
              <div className="space-y-6 bg-zinc-900 p-6 rounded-lg border border-zinc-800">
                <h2 className="text-xl font-bold text-white">
                  {t("checkout.paymentMethod.cod")}
                </h2>
                <p className="text-zinc-400 text-sm">
                  {t("checkout.paymentMethod.codDesc")}
                </p>
                <Button
                  onClick={handleCodPayment}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3"
                  disabled={isLoading}
                >
                  {isLoading
                    ? t("checkout.processing")
                    : t("checkout.completeOrder")}
                </Button>
              </div>
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
