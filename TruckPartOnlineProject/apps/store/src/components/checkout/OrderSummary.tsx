import { useTranslation } from "react-i18next";
import { type CartItem } from "@/types/product";
import { Separator } from "@/components/ui/separator";

interface OrderSummaryProps {
  items: CartItem[];
  total: number;
}

export function OrderSummary({ items, total }: OrderSummaryProps) {
  const { t } = useTranslation();

  return (
    <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800 sticky top-24">
      <h2 className="text-xl font-bold text-white mb-4">
        {t("checkout.orderSummary", "Resumen del Pedido")}
      </h2>

      <div className="space-y-4 mb-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
        {items.map((item) => (
          <div key={item.id} className="flex gap-4">
            <div className="relative w-16 h-16 bg-white/5 rounded-md overflow-hidden flex-shrink-0">
              {item.images && item.images.length > 0 ? (
                <img
                  src={item.images[0].image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-500 text-xs">
                  No img
                </div>
              )}
              <span className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-bl-md">
                x{item.quantity}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-white truncate">
                {item.name}
              </h4>
              <p className="text-xs text-zinc-400 truncate">SKU: {item.sku}</p>
            </div>
            <div className="text-sm font-bold text-white">
              ${(Number(item.price) * item.quantity).toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      <Separator className="bg-zinc-800 my-4" />

      <div className="space-y-2">
        <div className="flex justify-between text-zinc-400 text-sm">
          <span>{t("checkout.subtotal", "Subtotal")}</span>
          <span>${total.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-zinc-400 text-sm">
          <span>{t("checkout.shipping", "Envío")}</span>
          <span className="text-green-500">{t("checkout.free", "Gratis")}</span>
        </div>
      </div>

      <Separator className="bg-zinc-800 my-4" />

      <div className="flex justify-between text-white font-bold text-lg">
        <span>{t("checkout.total", "Total")}</span>
        <span className="text-red-500">${total.toFixed(2)}</span>
      </div>
    </div>
  );
}
