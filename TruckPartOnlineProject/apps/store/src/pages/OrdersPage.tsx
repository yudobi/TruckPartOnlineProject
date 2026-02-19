import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router";
import { Package, ChevronRight, Calendar } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useMyOrders } from "@/hooks/useOrders";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Order, OrderStatus } from "@/types/order";

export default function OrdersPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: ordersData,
    isLoading,
    isError,
  } = useMyOrders({
    page: currentPage,
    page_size: 10,
  });

  // Redirigir si no está autenticado
  if (!isAuthenticated) {
    navigate("/auth");
    return null;
  }

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black pt-32 pb-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <Skeleton className="h-10 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-black pt-32 pb-20">
        <div className="container mx-auto px-6 text-center">
          <Package size={64} className="mx-auto text-gray-700 mb-6" />
          <h2 className="text-2xl font-bold text-white mb-4">
            {t("orders.error")}
          </h2>
          <Button
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {t("orders.retry")}
          </Button>
        </div>
      </div>
    );
  }

  const orders = ordersData?.results || [];

  return (
    <div className="min-h-screen bg-black pt-32 pb-20">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block px-3 py-1 bg-red-600/10 border border-red-600/20 rounded-full mb-6 text-red-500 text-xs font-bold tracking-widest uppercase">
            {t("user.profile")}
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-4">
            {t("orders.title")}
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            {t("orders.subtitle")}
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-20">
            <Package size={64} className="mx-auto text-gray-700 mb-6" />
            <h2 className="text-2xl font-bold text-white mb-4">
              {t("orders.noOrders")}
            </h2>
            <p className="text-gray-500 mb-8">{t("orders.noOrdersDesc")}</p>
            <Link to="/products">
              <Button className="bg-red-600 hover:bg-red-700 text-white">
                {t("catalog.title")}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-4">
            {orders.map((order: Order) => (
              <Link
                key={order.id}
                to={`/orders/${order.id}`}
                className="block group"
              >
                <div className="bg-zinc-950 border border-white/5 hover:border-red-600/50 rounded-sm p-6 transition-all duration-300">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Order Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <span className="text-white font-bold text-lg">
                          {t("orders.orderNumber")}
                          {order.id}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(
                            order.status,
                          )}`}
                        >
                          {t(`orders.status.${order.status}`)}
                        </span>
                      </div>
                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} />
                          <span>{formatDate(order.created_at)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Package size={16} />
                          <span>
                            {order.items?.length || 0} {t("orders.items")}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Total and Arrow */}
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                          {t("orders.total")}
                        </p>
                        <p className="text-2xl font-light text-white">
                          ${parseFloat(order.total).toLocaleString()}
                        </p>
                      </div>
                      <ChevronRight
                        size={24}
                        className="text-gray-600 group-hover:text-red-600 group-hover:translate-x-1 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </Link>
            ))}

            {/* Pagination */}
            {ordersData &&
              ordersData.total_pages &&
              ordersData.total_pages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  {Array.from(
                    { length: ordersData.total_pages },
                    (_, i) => i + 1,
                  ).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-sm font-bold transition-all ${
                        currentPage === page
                          ? "bg-red-600 text-white"
                          : "bg-zinc-900 text-gray-400 hover:bg-zinc-800"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
}
