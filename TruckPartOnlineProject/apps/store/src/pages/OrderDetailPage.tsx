import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate, useParams } from "react-router";
import {
  Package,
  ChevronLeft,
  Calendar,
  MapPin,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useOrderById } from "@/hooks/useOrders";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { OrderStatus, PaymentStatus } from "@/types/order";

export default function OrderDetailPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();

  const orderId = id ? parseInt(id, 10) : null;
  const { data: order, isLoading, isError } = useOrderById(orderId);

  // Redirigir si no está autenticado
  if (!isAuthenticated) {
    navigate("/auth");
    return null;
  }

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "failed":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "pending":
      case "invoiced":
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "completed":
        return "bg-green-600 text-white";
      case "invoiced":
        return "bg-blue-600 text-white";
      case "pending":
        return "bg-yellow-600 text-white";
      case "failed":
        return "bg-red-600 text-white";
      default:
        return "bg-gray-600 text-white";
    }
  };

  const getPaymentStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case "paid":
        return "text-green-500";
      case "failed":
        return "text-red-500";
      case "pending":
      default:
        return "text-yellow-500";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black pt-32 pb-20">
        <div className="container mx-auto px-6">
          <Skeleton className="h-10 w-48 mb-8" />
          <div className="max-w-4xl mx-auto space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="min-h-screen bg-black pt-32 pb-20">
        <div className="container mx-auto px-6 text-center">
          <Package size={64} className="mx-auto text-gray-700 mb-6" />
          <h2 className="text-2xl font-bold text-white mb-4">
            {t("orders.error")}
          </h2>
          <Link to="/orders">
            <Button className="bg-red-600 hover:bg-red-700 text-white">
              <ChevronLeft className="w-4 h-4 mr-2" />
              {t("orders.backToOrders")}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-32 pb-20">
      <Helmet>
        <title>{t("orders.orderDetail")} #{id} | Tony Truck Parts</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="container mx-auto px-6">
        {/* Back Button */}
        <Link to="/orders" className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition-colors">
          <ChevronLeft className="w-5 h-5 mr-1" />
          {t("orders.backToOrders")}
        </Link>

        {/* Header */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-white mb-2">
                {t("orders.orderDetails")}
              </h1>
              <p className="text-gray-400">
                {t("orders.orderNumber")}{order.id}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {getStatusIcon(order.status)}
              <span
                className={`px-4 py-2 rounded-sm text-sm font-bold uppercase ${getStatusColor(
                  order.status
                )}`}
              >
                {t(`orders.orderStatus.${order.status}`)}
              </span>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6">
          {/* Order Info */}
          <div className="md:col-span-2 space-y-6">
            {/* Items */}
            <div className="bg-zinc-950 border border-white/5 rounded-sm p-6">
              <h2 className="text-lg font-bold text-white mb-6">
                {t("orders.items")}
              </h2>
              <div className="space-y-4">
                {order.items?.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 pb-4 border-b border-white/5 last:border-0 last:pb-0"
                  >
                    {/* Product Image */}
                    <div className="w-20 h-20 bg-zinc-900 rounded-sm overflow-hidden flex-shrink-0">
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-8 h-8 text-gray-700" />
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="flex-1">
                      <h3 className="text-white font-medium mb-1">
                        {item.product_name}
                      </h3>
                      {item.product_sku && (
                        <p className="text-xs text-gray-500">
                          SKU: {item.product_sku}
                        </p>
                      )}
                    </div>

                    {/* Quantity and Price */}
                    <div className="text-right">
                      <p className="text-gray-400 text-sm">
                        x{item.quantity}
                      </p>
                      <p className="text-white font-bold">
                        ${item.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            {order.shipping_address && (
              <div className="group relative bg-zinc-950 border border-white/10 rounded-xl p-8 overflow-hidden transition-all duration-500 hover:border-red-600/30">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-red-600/5 blur-[80px] rounded-full pointer-events-none group-hover:bg-red-600/10 transition-colors" />

                <div className="relative flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-full bg-red-600/10 border border-red-600/20 flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.1)] group-hover:shadow-[0_0_30px_rgba(220,38,38,0.2)] transition-all">
                    <MapPin className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white tracking-tight uppercase italic">
                      {t("orders.shippingAddress")}
                    </h2>
                    <div className="h-0.5 w-12 bg-red-600 mt-1" />
                  </div>
                </div>

                <div className="relative grid gap-6">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{t("checkout.shippingAddress", "Dirección de Envío")}</span>
                    <p className="text-lg text-white font-medium leading-tight">
                      {order.shipping_address}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-6 border-t border-white/5">
                    {order.city && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{t("checkout.city", "Ciudad")}</span>
                        <p className="text-sm text-white font-bold">{order.city}</p>
                      </div>
                    )}
                    {order.state && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{t("checkout.state", "Estado")}</span>
                        <p className="text-sm text-white font-bold">{order.state}</p>
                      </div>
                    )}
                    {order.postal_code && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{t("checkout.postalCode", "Código Postal")}</span>
                        <p className="text-sm font-mono text-red-500 font-black tracking-tighter">{order.postal_code}</p>
                      </div>
                    )}
                    {order.country && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{t("checkout.country", "País")}</span>
                        <p className="text-sm text-white font-bold">{order.country}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            {/* Summary Card */}
            <div className="bg-zinc-950 border border-white/5 rounded-sm p-6">
              <h2 className="text-lg font-bold text-white mb-6">
                {t("orders.orderDetails")}
              </h2>

              <div className="space-y-4">
                {/* Date */}
                <div className="flex items-center gap-3 text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">{formatDate(order.created_at)}</span>
                </div>

                {/* Payment Method */}
                <div className="flex items-center gap-3">
                  <CreditCard className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-400">
                      {t("orders.paymentMethod")}
                    </p>
                    <p className="text-white font-medium">
                      {t(`orders.paymentMethods.${order.payment_method}`)}
                    </p>
                  </div>
                </div>

                {/* Payment Status */}
                <div className="pt-4 border-t border-white/5">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-400">
                      {t("orders.paymentStatusTitle")}
                    </span>
                    <span className={`text-sm font-bold ${getPaymentStatusColor(order.payment_status)}`}>
                      {t(`orders.paymentStatus.${order.payment_status}`)}
                    </span>
                  </div>
                </div>

                {/* Totals */}
                <div className="pt-4 border-t border-white/5 space-y-2">
                  {order.subtotal != null && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">
                        {t("orders.subtotal", "Subtotal")}
                      </span>
                      <span className="text-sm text-white font-medium">
                        ${Number(order.subtotal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                  {order.tax != null && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">
                        {t("orders.tax", "Impuesto (7%)")}
                      </span>
                      <span className="text-sm text-white font-medium">
                        ${Number(order.tax).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-end border-t border-white/5 pt-2 mt-1">
                    <span className="text-gray-400">
                      {t("orders.total")}
                    </span>
                    <span className="text-3xl font-light text-white">
                      ${Number(order.total).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
