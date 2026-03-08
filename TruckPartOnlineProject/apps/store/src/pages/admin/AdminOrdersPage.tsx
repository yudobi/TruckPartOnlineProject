import { useState } from "react";
import { useNavigate } from "react-router";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useAdminOrders } from "@/hooks/useAdminOrders";
import type { AdminOrderFilters } from "@/types/admin";
import type { OrderStatus, PaymentStatus } from "@/types/order";

// ---------------------------------------------------------------------------
// Badge helpers
// ---------------------------------------------------------------------------
function StatusBadge({ status }: { status: OrderStatus }) {
  const config: Record<OrderStatus, { label: string; className: string }> = {
    pending: {
      label: "Pendiente",
      className: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
    },
    invoiced: {
      label: "Facturado",
      className: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
    },
    completed: {
      label: "Completado",
      className: "bg-green-500/20 text-green-400 border border-green-500/30",
    },
    failed: {
      label: "Fallido",
      className: "bg-red-500/20 text-red-400 border border-red-500/30",
    },
  };

  const { label, className } = config[status] ?? {
    label: status,
    className: "bg-zinc-700 text-zinc-300",
  };

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${className}`}>
      {label}
    </span>
  );
}

function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const config: Record<PaymentStatus, { label: string; className: string }> = {
    pending: {
      label: "Pendiente",
      className: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
    },
    paid: {
      label: "Pagado",
      className: "bg-green-500/20 text-green-400 border border-green-500/30",
    },
    failed: {
      label: "Fallido",
      className: "bg-red-500/20 text-red-400 border border-red-500/30",
    },
  };

  const { label, className } = config[status] ?? {
    label: status,
    className: "bg-zinc-700 text-zinc-300",
  };

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${className}`}>
      {label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------
export default function AdminOrdersPage() {
  const navigate = useNavigate();

  const [filters, setFilters] = useState<AdminOrderFilters>({
    page: 1,
    page_size: 20,
  });

  const [searchInput, setSearchInput] = useState("");

  const { data, isLoading, isError } = useAdminOrders(filters);

  const totalPages = data ? Math.ceil(data.count / (filters.page_size ?? 20)) : 1;

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, search: searchInput || undefined, page: 1 }));
  }

  function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value as OrderStatus | "";
    setFilters((prev) => ({
      ...prev,
      status: value !== "" ? (value as OrderStatus) : undefined,
      page: 1,
    }));
  }

  function handlePaymentStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value as PaymentStatus | "";
    setFilters((prev) => ({
      ...prev,
      payment_status: value !== "" ? (value as PaymentStatus) : undefined,
      page: 1,
    }));
  }

  function handlePageChange(newPage: number) {
    setFilters((prev) => ({ ...prev, page: newPage }));
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function formatCurrency(value: number) {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "USD",
    }).format(value);
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Administración de <span className="text-red-600">Órdenes</span>
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            {data ? `${data.count} órdenes en total` : "Cargando órdenes..."}
          </p>
        </div>

        {/* Filter Bar */}
        <div className="bg-zinc-900 border border-white/10 rounded-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, email o ID..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-white/10 rounded text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-600 transition-colors"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded transition-colors"
              >
                Buscar
              </button>
            </form>

            {/* Status filter */}
            <select
              value={filters.status ?? ""}
              onChange={handleStatusChange}
              className="px-3 py-2 bg-zinc-800 border border-white/10 rounded text-sm text-white focus:outline-none focus:border-red-600 transition-colors cursor-pointer"
            >
              <option value="">Todos los estados</option>
              <option value="pending">Pendiente</option>
              <option value="invoiced">Facturado</option>
              <option value="completed">Completado</option>
              <option value="failed">Fallido</option>
            </select>

            {/* Payment status filter */}
            <select
              value={filters.payment_status ?? ""}
              onChange={handlePaymentStatusChange}
              className="px-3 py-2 bg-zinc-800 border border-white/10 rounded text-sm text-white focus:outline-none focus:border-red-600 transition-colors cursor-pointer"
            >
              <option value="">Todos los pagos</option>
              <option value="pending">Pago pendiente</option>
              <option value="paid">Pagado</option>
              <option value="failed">Pago fallido</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-zinc-900 border border-white/10 rounded-lg overflow-hidden">
          {isLoading && (
            <div className="flex items-center justify-center h-64">
              <span className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {isError && (
            <div className="flex items-center justify-center h-64 text-red-400">
              Error al cargar las órdenes. Verifica tu conexión e inténtalo de nuevo.
            </div>
          )}

          {!isLoading && !isError && (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 bg-zinc-800/50">
                      <th className="text-left px-4 py-3 text-xs font-bold tracking-widest text-zinc-400 uppercase">
                        # ID
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-bold tracking-widest text-zinc-400 uppercase">
                        Cliente
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-bold tracking-widest text-zinc-400 uppercase">
                        Estado
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-bold tracking-widest text-zinc-400 uppercase">
                        Método Pago
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-bold tracking-widest text-zinc-400 uppercase">
                        Estado Pago
                      </th>
                      <th className="text-right px-4 py-3 text-xs font-bold tracking-widest text-zinc-400 uppercase">
                        Total
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-bold tracking-widest text-zinc-400 uppercase">
                        Fecha
                      </th>
                      <th className="text-center px-4 py-3 text-xs font-bold tracking-widest text-zinc-400 uppercase">
                        Items
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.results.length === 0 && (
                      <tr>
                        <td
                          colSpan={8}
                          className="text-center py-16 text-zinc-500"
                        >
                          No se encontraron órdenes con los filtros aplicados.
                        </td>
                      </tr>
                    )}
                    {data?.results.map((order) => (
                      <tr
                        key={order.id}
                        onClick={() => navigate(`/admin/orders/${order.id}`)}
                        className="border-b border-white/5 hover:bg-zinc-800/60 cursor-pointer transition-colors group"
                      >
                        <td className="px-4 py-3 font-mono text-red-500 font-bold group-hover:text-red-400">
                          #{order.id}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-white font-medium">
                            {order.full_name ?? "—"}
                          </div>
                          <div className="text-xs text-zinc-500">
                            {order.user_email ?? order.guest_email ?? "—"}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="px-4 py-3 text-zinc-300 uppercase text-xs font-semibold">
                          {order.payment_method === "cod" ? "Contra entrega" : "Tarjeta"}
                        </td>
                        <td className="px-4 py-3">
                          <PaymentStatusBadge status={order.payment_status} />
                        </td>
                        <td className="px-4 py-3 text-right text-white font-semibold">
                          {formatCurrency(order.total)}
                        </td>
                        <td className="px-4 py-3 text-zinc-400 text-xs">
                          {formatDate(order.created_at)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-zinc-700 text-white text-xs font-bold">
                            {order.items_count}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-white/10 bg-zinc-800/30">
                  <span className="text-xs text-zinc-500">
                    Página {filters.page} de {totalPages}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange((filters.page ?? 1) - 1)}
                      disabled={(filters.page ?? 1) <= 1}
                      className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4 text-white" />
                    </button>
                    <button
                      onClick={() => handlePageChange((filters.page ?? 1) + 1)}
                      disabled={(filters.page ?? 1) >= totalPages}
                      className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
