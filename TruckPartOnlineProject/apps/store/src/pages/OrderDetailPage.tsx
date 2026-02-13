import { useTranslation } from "react-i18next";
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
                {t(`orders.status.${order.status}`)}
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
                      {item.product.images && item.product.images.length > 0 ? (
                        <img
                          src={item.product.images.find((img) => img.is_main)?.image || item.product.images[0].image}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-8 h-8 text-gray-700" />
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1">
                      <h3 className="text-white font-medium mb-1">
                        {item.product.name}
                      </h3>
                      {item.product.sku && (
                        <p className="text-xs text-gray-500">
                          SKU: {item.product.sku}
                        </p>
                      )}
                    </div>

                    {/* Quantity and Price */}
                    <div className="text-right">
                      <p className="text-gray-400 text-sm">
                        x{item.quantity}
                      </p>
                      <p className="text-white font-bold">
                        ${parseFloat(item.price).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            {order.shipping_address && (
              <div className="bg-zinc-950 border border-white/5 rounded-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <MapPin className="w-5 h-5 text-red-600" />
                  <h2 className="text-lg font-bold text-white">
                    {t("orders.shippingAddress")}
                  </h2>
                </div>
                <div className="text-gray-400 space-y-1">
                  <p>{order.shipping_address}</p>
                  {order.city && <p>{order.city}</p>}
                  {order.state && <p>{order.state}</p>}
                  {order.country && <p>{order.country}</p>}
                  {order.postal_code && <p>{order.postal_code}</p>}
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
                      {t("orders.paymentStatus")}
                    </span>
                    <span className={`text-sm font-bold ${getPaymentStatusColor(order.payment_status)}`}>
                      {t(`orders.paymentStatus.${order.payment_status}`)}
                    </span>
                  </div>
                </div>

                {/* Total */}
                <div className="pt-4 border-t border-white/5">
                  <div className="flex justify-between items-end">
                    <span className="text-gray-400">
                      {t("orders.total")}
                    </span>
                    <span className="text-3xl font-light text-white">
                      ${parseFloat(order.total).toLocaleString()}
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
