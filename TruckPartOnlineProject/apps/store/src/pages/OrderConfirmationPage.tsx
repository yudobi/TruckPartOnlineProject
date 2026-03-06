import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { CheckCircle, Package, MapPin, CreditCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { orderService } from "@/services/orderService";

// Local type matching the backend GET /api/{order_id}/ response shape
interface ConfirmationOrderItem {
  product: string;
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

export default function OrderConfirmationPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<ConfirmationOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        // Cast to our local confirmation type since the shapes overlap
        setOrder(data as unknown as ConfirmationOrder);
      })
      .catch(() => {
        setError("No pudimos cargar los detalles de tu pedido.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [id, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black pt-24 px-6 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-red-600 animate-spin mb-4" />
        <p className="text-zinc-400 text-sm">Cargando tu pedido...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-black pt-24 px-6 flex flex-col items-center justify-center gap-4">
        <p className="text-white text-lg font-semibold">
          {error ?? "Pedido no encontrado."}
        </p>
        <Button
          onClick={() => navigate("/orders")}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          Ver mis pedidos
        </Button>
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

  return (
    <div className="min-h-screen bg-black pt-24 pb-16 px-6">
      <div className="container mx-auto max-w-2xl">
        {/* Success header */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-20 h-20 rounded-full bg-green-600/10 border border-green-600/30 flex items-center justify-center mb-5">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter mb-1">
            ¡PEDIDO CONFIRMADO!
          </h1>
          <p className="text-zinc-400 text-sm">{formattedDate}</p>
        </div>

        {/* Order card */}
        <div className="bg-zinc-900 border border-white/10 rounded-xl overflow-hidden space-y-0 divide-y divide-white/10">
          {/* Order number + status */}
          <div className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">
                Número de pedido
              </p>
              <p className="text-white font-bold text-lg">#{order.id}</p>
            </div>
            <span className="px-3 py-1 bg-red-600/10 border border-red-600/40 text-red-400 text-xs font-semibold rounded-full uppercase tracking-wider">
              {order.status}
            </span>
          </div>

          {/* Items */}
          <div className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-4 h-4 text-red-500" />
              <p className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">
                Productos
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
                      {item.product}
                    </p>
                    <p className="text-zinc-500 text-xs mt-0.5">
                      Cantidad: {item.quantity}
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
            <p className="text-sm font-semibold text-zinc-300">Total</p>
            <p className="text-xl font-black text-red-500">
              ${order.total.toLocaleString()}
            </p>
          </div>

          {/* Shipping address */}
          {shippingDisplay && (
            <div className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-red-500" />
                <p className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">
                  Dirección de envío
                </p>
              </div>
              <p className="text-zinc-400 text-sm">{shippingDisplay}</p>
            </div>
          )}

          {/* Payment method */}
          {order.payment_method && (
            <div className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-4 h-4 text-red-500" />
                <p className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">
                  Método de pago
                </p>
              </div>
              <p className="text-zinc-400 text-sm capitalize">
                {order.payment_method === "cod"
                  ? "Pago contra entrega"
                  : order.payment_method === "card"
                  ? "Tarjeta de crédito/débito"
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
            Ver mis pedidos
          </Button>
          <Button
            onClick={() => navigate("/products")}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold"
          >
            Seguir comprando
          </Button>
        </div>
      </div>
    </div>
  );
}
