import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import { CheckCircle, XCircle, Package, MapPin, CreditCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { orderService } from "@/services/orderService";
import { loadStripe } from "@stripe/stripe-js";
import { useCart } from "@hooks/useCart";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string);

// Local type matching the backend GET /api/{order_id}/ response shape
interface ConfirmationOrderItem {
  product: {
    id: number;
    name: string;
    sku?: string;
    images?: { id: number; image: string; is_main: boolean }[];
  };
  quantity: number;
  price: number;
}

interface ConfirmationOrder {
  id: number;
  status: string;
  total: number;
  qb_sales_id?: string;
  items: ConfirmationOrderItem[];
  created_at: string;
  shipping_address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postal_code?: string | null;
  payment_method?: string;
}

type StripePaymentStatus = "succeeded" | "processing" | "requires_payment_method" | null;

export default function OrderConfirmationPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { clearCart } = useCart();

  const [order, setOrder] = useState<ConfirmationOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stripePaymentStatus, setStripePaymentStatus] = useState<StripePaymentStatus>(null);
  const [stripeChecked, setStripeChecked] = useState(false);

  // Check if this is a Stripe redirect
  const paymentIntentClientSecret = searchParams.get("payment_intent_client_secret");
  const redirectStatus = searchParams.get("redirect_status");
  const isStripeRedirect = paymentIntentClientSecret != null;

  const hasCleared = useRef(false);

  // Verify Stripe payment status when redirected from Stripe
  useEffect(() => {
    if (!isStripeRedirect) {
      setStripeChecked(true);
      return;
    }

    stripePromise.then((stripe) => {
      if (!stripe) {
        setStripeChecked(true);
        return;
      }

      stripe.retrievePaymentIntent(paymentIntentClientSecret!).then(({ paymentIntent }) => {
        const status = (paymentIntent?.status ?? null) as StripePaymentStatus;
        setStripePaymentStatus(status);

        if (status === "succeeded" && !hasCleared.current) {
          hasCleared.current = true;
          clearCart();
        }

        setStripeChecked(true);
      });
    });
  }, [isStripeRedirect, paymentIntentClientSecret, clearCart]);

  // Load order details
  useEffect(() => {
    if (!id) {
      navigate("/orders");
      return;
    }

    const orderId = parseInt(id, 10);
    if (isNaN(orderId)) {
      navigate("/orders");
      return;
    }

    setIsLoading(true);
    setError(null);

    orderService
      .getOrderById(orderId)
      .then((data) => {
        setOrder(data as unknown as ConfirmationOrder);
      })
      .catch(() => {
        setError(t("confirmation.error"));
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [id, navigate, t]);

  const showLoading = isLoading || (isStripeRedirect && !stripeChecked);

  if (showLoading) {
    return (
      <div className="min-h-screen bg-black pt-24 px-6 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-red-600 animate-spin mb-4" />
        <p className="text-zinc-400 text-sm">{t("confirmation.loading")}</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-black pt-24 px-6 flex flex-col items-center justify-center gap-4">
        <p className="text-white text-lg font-semibold">
          {error ?? t("confirmation.notFound")}
        </p>
        <Button
          onClick={() => navigate("/orders")}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          {t("confirmation.viewOrders")}
        </Button>
      </div>
    );
  }

  // For Stripe redirects that failed
  if (isStripeRedirect && stripePaymentStatus !== "succeeded" && stripePaymentStatus !== null) {
    return (
      <div className="min-h-screen bg-black pt-24 px-6 flex flex-col items-center justify-center gap-4">
        <div className="w-20 h-20 rounded-full bg-red-600/10 border border-red-600/30 flex items-center justify-center mb-5">
          <XCircle className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-2xl font-black text-white tracking-tighter">
          {t("confirmation.paymentFailed")}
        </h1>
        <p className="text-zinc-400 text-sm text-center max-w-sm">
          {stripePaymentStatus === "processing"
            ? t("confirmation.paymentProcessing")
            : t("confirmation.paymentFailedDesc")}
        </p>
        <div className="flex gap-3 mt-4">
          <Button
            onClick={() => navigate("/orders")}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/5 bg-transparent"
          >
            {t("confirmation.viewOrders")}
          </Button>
          <Button
            onClick={() => navigate("/products")}
            className="bg-red-600 hover:bg-red-700 text-white font-bold"
          >
            {t("confirmation.continueShopping")}
          </Button>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(order.created_at).toLocaleDateString("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const shippingParts = [
    order.shipping_address,
    order.city,
    order.state,
    order.postal_code,
    order.country,
  ].filter(Boolean);

  const shippingDisplay =
    shippingParts.length > 0 ? shippingParts.join(", ") : null;

  // Determine if the redirect_status from Stripe indicates success
  const isPaymentSucceeded =
    !isStripeRedirect ||
    stripePaymentStatus === "succeeded" ||
    redirectStatus === "succeeded";

  return (
    <div className="min-h-screen bg-black pt-24 pb-16 px-6">
      <div className="container mx-auto max-w-2xl">
        {/* Success header */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-20 h-20 rounded-full bg-green-600/10 border border-green-600/30 flex items-center justify-center mb-5">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter mb-1">
            {isPaymentSucceeded
              ? t("confirmation.title")
              : t("confirmation.orderReceived")}
          </h1>
          <p className="text-zinc-400 text-sm">{formattedDate}</p>
        </div>

        {/* Order card */}
        <div className="bg-zinc-900 border border-white/10 rounded-xl overflow-hidden space-y-0 divide-y divide-white/10">
          {/* Order number + status */}
          <div className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">
                {t("confirmation.orderNumber")}
              </p>
              <p className="text-white font-bold text-lg">#{order.id}</p>
            </div>
            <span className="px-3 py-1 bg-red-600/10 border border-red-600/40 text-red-400 text-xs font-semibold rounded-full uppercase tracking-wider">
              {t(`orders.orderStatus.${order.status}`, order.status)}
            </span>
          </div>

          {/* Items */}
          <div className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-4 h-4 text-red-500" />
              <p className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">
                {t("confirmation.products")}
              </p>
            </div>
            <ul className="space-y-3">
              {order.items.map((item, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex-1 pr-4">
                    <p className="text-white font-medium line-clamp-1">
                      {item.product.name}
                    </p>
                    <p className="text-zinc-500 text-xs mt-0.5">
                      {t("confirmation.quantity")}: {item.quantity}
                    </p>
                  </div>
                  <p className="text-white font-semibold flex-shrink-0">
                    ${(item.price * item.quantity).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          {/* Total */}
          <div className="p-5 flex items-center justify-between">
            <p className="text-sm font-semibold text-zinc-300">{t("confirmation.total")}</p>
            <p className="text-xl font-black text-red-500">
              ${order.total.toLocaleString()}
            </p>
          </div>

          {/* Shipping address */}
          {shippingDisplay && (
            <div className="p-6 relative overflow-hidden group">
              {/* Subtle background glow */}
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-red-600/5 blur-[40px] rounded-full pointer-events-none group-hover:bg-red-600/10 transition-colors" />

              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-red-600/10 border border-red-600/20 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-red-500" />
                </div>
                <p className="text-xs font-black text-zinc-300 uppercase tracking-widest">
                  {t("confirmation.shippingAddress")}
                </p>
              </div>

              <div className="pl-11">
                <p className="text-white font-medium leading-relaxed">
                  {order.shipping_address}
                </p>
                {(order.city || order.state || order.postal_code) && (
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
                    {order.city && <span className="text-zinc-400 text-xs font-bold">{order.city}</span>}
                    {order.state && <span className="text-zinc-400 text-xs font-bold">{order.state}</span>}
                    {order.postal_code && <span className="text-red-500 text-xs font-mono font-black">{order.postal_code}</span>}
                    {order.country && <span className="text-zinc-400 text-xs font-bold">{order.country}</span>}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Payment method */}
          {order.payment_method && (
            <div className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-4 h-4 text-red-500" />
                <p className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">
                  {t("confirmation.paymentMethod")}
                </p>
              </div>
              <p className="text-zinc-400 text-sm capitalize">
                {order.payment_method === "cod"
                  ? t("confirmation.paymentMethods.cod")
                  : order.payment_method === "card"
                    ? t("confirmation.paymentMethods.card")
                    : order.payment_method}
              </p>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-8">
          <Button
            onClick={() => navigate("/orders")}
            variant="outline"
            className="flex-1 border-white/20 text-white hover:bg-white/5 bg-transparent"
          >
            {t("confirmation.viewOrders")}
          </Button>
          <Button
            onClick={() => navigate("/products")}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold"
          >
            {t("confirmation.continueShopping")}
          </Button>
        </div>
      </div>
    </div>
  );
}
