import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Package } from "lucide-react";
import { toast } from "sonner";
import { useAdminOrderById, useUpdateOrderStatus } from "@/hooks/useAdminOrders";
import type { OrderStatus, PaymentStatus } from "@/types/order";

// ---------------------------------------------------------------------------
// Badge helpers
// ---------------------------------------------------------------------------
function StatusBadge({ status }: { status: OrderStatus }) {
  const { t } = useTranslation();
  const config: Record<OrderStatus, { className: string }> = {
    pending: {
      className: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
    },
    invoiced: {
      className: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
    },
    completed: {
      className: "bg-green-500/20 text-green-400 border border-green-500/30",
    },
    failed: {
      className: "bg-red-500/20 text-red-400 border border-red-500/30",
    },
  };

  const { className } = config[status] ?? {
    className: "bg-zinc-700 text-zinc-300",
  };

  return (
    <span
      className={`px-3 py-1 rounded text-sm font-semibold ${className}`}
    >
      {t(`orders.orderStatus.${status}`)}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Section wrapper
// ---------------------------------------------------------------------------
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-zinc-900 border border-white/10 rounded-lg overflow-hidden">
      <div className="px-5 py-3 bg-zinc-800/50 border-b border-white/10">
        <h2 className="text-sm font-bold tracking-widest text-zinc-300 uppercase">
          {title}
        </h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Detail row helper
// ---------------------------------------------------------------------------
function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1">
      <span className="text-xs text-zinc-500 w-32 shrink-0">{label}</span>
      <span className="text-sm text-white">{value ?? "—"}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------
export default function AdminOrderDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const orderId = id ? parseInt(id, 10) : null;

  const { data: order, isLoading, isError } = useAdminOrderById(orderId);
  const updateStatus = useUpdateOrderStatus();

  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "">("");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<PaymentStatus | "">("");

  function handleUpdate() {
    if (!orderId) return;
    if (!selectedStatus && !selectedPaymentStatus) {
      toast.error(t("admin.orders.selectStatus"));
      return;
    }

    const payload: { status?: OrderStatus; payment_status?: PaymentStatus } = {};
    if (selectedStatus) payload.status = selectedStatus;
    if (selectedPaymentStatus) payload.payment_status = selectedPaymentStatus;

    updateStatus.mutate(
      { orderId, data: payload },
      {
        onSuccess: () => {
          toast.success(t("admin.orders.updateSuccess"));
          setSelectedStatus("");
          setSelectedPaymentStatus("");
        },
        onError: () => {
          toast.error(t("admin.orders.updateError"));
        },
      }
    );
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatCurrency(value: number | string) {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "USD",
    }).format(num);
  }

  // ---------------------------------------------------------------------------
  // Loading / error states
  // ---------------------------------------------------------------------------
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <span className="w-10 h-10 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4 text-white">
        <p className="text-red-400">{t("admin.orders.errorLoadingOrder")}</p>
        <button
          onClick={() => navigate("/admin/orders")}
          className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("admin.orders.backToList")}
        </button>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-black text-white px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <button
            onClick={() => navigate("/admin/orders")}
            className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("admin.orders.backToList")}
          </button>

          <div className="flex flex-wrap items-center gap-4">
            <h1 className="text-3xl font-bold tracking-tight text-white">
              {t("admin.orders.orderDetail")} <span className="text-red-600">#{order.id}</span>
            </h1>
            <StatusBadge status={order.status} />
            <span className="text-sm text-zinc-500">
              {formatDate(order.created_at)}
            </span>
          </div>
        </div>

        {/* Two-column grid for info sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer Info */}
          <Section title={t("admin.orders.customerInfo")}>
            <div className="space-y-3">
              <DetailRow label={t("admin.orders.name")} value={order.full_name} />
              <DetailRow
                label={t("admin.orders.email")}
                value={order.user?.email ?? order.guest_email}
              />
              <DetailRow label={t("admin.orders.phone")} value={order.phone} />
              {order.user && (
                <DetailRow
                  label={t("admin.orders.user")}
                  value={`${order.user.username} (ID: ${order.user.id})`}
                />
              )}
            </div>
          </Section>

          {/* Shipping Address */}
          <Section title={t("admin.orders.shippingAddress")}>
            <div className="space-y-3">
              <DetailRow label={t("admin.orders.address")} value={order.shipping_address} />
              <DetailRow label={t("admin.orders.city")} value={order.city} />
              <DetailRow label={t("admin.orders.state")} value={order.state} />
              <DetailRow label={t("admin.orders.country")} value={order.country} />
              <DetailRow label={t("admin.orders.postalCode")} value={order.postal_code} />
            </div>
          </Section>
        </div>

        {/* Order Items */}
        <Section title={t("admin.orders.orderItems")}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  <th className="pb-2 text-xs font-bold tracking-widest text-zinc-500 uppercase">
                    {t("admin.orders.product")}
                  </th>
                  <th className="pb-2 text-xs font-bold tracking-widest text-zinc-500 uppercase">
                    {t("admin.orders.sku")}
                  </th>
                  <th className="pb-2 text-center text-xs font-bold tracking-widest text-zinc-500 uppercase">
                    {t("admin.orders.quantity")}
                  </th>
                  <th className="pb-2 text-right text-xs font-bold tracking-widest text-zinc-500 uppercase">
                    {t("admin.orders.price")}
                  </th>
                  <th className="pb-2 text-right text-xs font-bold tracking-widest text-zinc-500 uppercase">
                    {t("admin.orders.subtotal")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => {
                  return (
                    <tr
                      key={item.id}
                      className="border-b border-white/5 last:border-0"
                    >
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded bg-zinc-800 border border-white/10 flex items-center justify-center">
                            <Package className="w-5 h-5 text-zinc-600" />
                          </div>
                          <span className="text-white font-medium">
                            {item.product_name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 text-zinc-500 text-xs font-mono">
                        {item.product_sku ?? "—"}
                      </td>
                      <td className="py-3 text-center text-zinc-300">
                        {item.quantity}
                      </td>
                      <td className="py-3 text-right text-zinc-300">
                        {formatCurrency(item.price)}
                      </td>
                      <td className="py-3 text-right text-white font-semibold">
                        {formatCurrency(
                          item.price * item.quantity
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Section>

        {/* Order Summary */}
        <Section title={t("admin.orders.orderSummary")}>
          <div className="space-y-2 max-w-xs ml-auto">
            <div className="flex justify-between text-sm text-zinc-400">
              <span>{t("admin.orders.subtotal")}</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-zinc-400 border-b border-white/10 pb-2">
              <span>{t("admin.orders.tax")}</span>
              <span>{formatCurrency(order.tax)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-white pt-2">
              <span>{t("admin.orders.total")}</span>
              <span className="text-red-500">{formatCurrency(order.total)}</span>
            </div>
            <div className="text-xs text-zinc-500 text-right">
              {t("admin.orders.method")}:{" "}
              <span className="text-zinc-300 font-semibold">
                {order.payment_method === "cod" ? t("orders.paymentMethods.cod") : t("orders.paymentMethods.card")}
              </span>
            </div>
          </div>
        </Section>

        {/* Status Management */}
        <Section title={t("admin.orders.statusManagement")}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-zinc-500 font-semibold uppercase tracking-widest">
                {t("admin.orders.orderStatus")}
              </label>
              <select
                value={selectedStatus}
                onChange={(e) =>
                  setSelectedStatus(e.target.value as OrderStatus | "")
                }
                className="w-full px-3 py-2 bg-zinc-800 border border-white/10 rounded text-sm text-white focus:outline-none focus:border-red-600 transition-colors cursor-pointer"
              >
                <option value="">
                  {t("admin.orders.current")}: {t(`orders.orderStatus.${order.status}`)}
                </option>
                <option value="pending">{t("orders.orderStatus.pending")}</option>
                <option value="invoiced">{t("orders.orderStatus.invoiced")}</option>
                <option value="completed">{t("orders.orderStatus.completed")}</option>
                <option value="failed">{t("orders.orderStatus.failed")}</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-zinc-500 font-semibold uppercase tracking-widest">
                {t("admin.orders.paymentStatus")}
              </label>
              <select
                value={selectedPaymentStatus}
                onChange={(e) =>
                  setSelectedPaymentStatus(e.target.value as PaymentStatus | "")
                }
                className="w-full px-3 py-2 bg-zinc-800 border border-white/10 rounded text-sm text-white focus:outline-none focus:border-red-600 transition-colors cursor-pointer"
              >
                <option value="">
                  {t("admin.orders.current")}: {t(`orders.paymentStatus.${order.payment_status}`)}
                </option>
                <option value="pending">{t("orders.paymentStatus.pending")}</option>
                <option value="paid">{t("orders.paymentStatus.paid")}</option>
                <option value="failed">{t("orders.paymentStatus.failed")}</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={handleUpdate}
              disabled={updateStatus.isPending}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold rounded transition-colors flex items-center gap-2"
            >
              {updateStatus.isPending && (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {t("admin.orders.update")}
            </button>
          </div>
        </Section>

        {/* QuickBooks Info */}
        {(order.qb_invoice_id || order.qb_sales_receipt_id) && (
          <Section title={t("admin.orders.quickbooksInfo")}>
            <div className="space-y-3">
              {order.qb_invoice_id && (
                <DetailRow label={t("admin.orders.invoiceId")} value={order.qb_invoice_id} />
              )}
              {order.qb_sales_receipt_id && (
                <DetailRow
                  label={t("admin.orders.salesReceiptId")}
                  value={order.qb_sales_receipt_id}
                />
              )}
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}
