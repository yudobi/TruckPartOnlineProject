import { Minus, Plus, ShoppingCart, Trash2, X } from "lucide-react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { useCart } from "@hooks/useCart";

import { useCheckout } from "@hooks/useCheckout";
import { useNavigate } from "react-router";

export default function CartSidebar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, subtotal, itemCount } = useCart();
  const { createOrder, isLoading, error } = useCheckout();

  const handleCheckout = async () => {
    try {
      const orderData = {
        items: items.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
        })),
        // Enviamos datos vacíos para shipping_address ya que es opcional en la interfaz
        // y se supone que el backend creará la orden en estado pendiente
      };

      const response = await createOrder(orderData);

      // Navegar al checkout pasando los datos de la orden creada
      navigate("/checkout", { state: { checkoutData: response } });
    } catch (error) {
      console.error("Error creating order:", error);
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="flex items-center gap-3 focus:outline-none cursor-pointer group relative">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-zinc-900 flex items-center justify-center text-white border border-white/10 group-hover:border-red-600/50 group-hover:bg-red-600/10 transition-all duration-300">
              <ShoppingCart className="w-5 h-5 group-hover:text-red-500 transition-colors" />
            </div>
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full border border-black">
                {itemCount}
              </span>
            )}
          </div>
        </button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md bg-zinc-950 border-l border-white/10 p-0 flex flex-col">
        <SheetHeader className="p-6 border-b border-white/10 flex flex-row items-center justify-between">
          <SheetTitle className="text-white flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-red-600" />
            {t("cart.title")} ({itemCount})
          </SheetTitle>
          <SheetClose asChild>
            <button
              className="text-gray-400 hover:text-white transition-colors p-1 rounded-md hover:bg-white/10"
              aria-label={t("cart.close") || "Cerrar carrito"}
            >
              <X className="w-5 h-5" />
            </button>
          </SheetClose>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center text-zinc-700">
                <ShoppingCart className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <p className="text-white font-medium">{t("cart.empty")}</p>
                <p className="text-sm text-gray-500">{t("cart.emptyDesc")}</p>
              </div>
              <div className="pt-4">
                <SheetClose asChild>
                  <Link to="/products">
                    <Button
                      variant="default"
                      className="border-white/10 hover:bg-white/5 text-white"
                    >
                      {t("cart.explore")}
                    </Button>
                  </Link>
                </SheetClose>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 group">
                  <div className="w-20 h-20 bg-zinc-900 rounded-md overflow-hidden border border-white/10 flex-shrink-0">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="text-white font-medium line-clamp-2 text-sm leading-snug">
                          {item.name}
                        </h4>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-gray-500 hover:text-red-500 transition-colors p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-sm text-gray-400 mt-1">
                        ${item.price.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2 border border-white/10 rounded-md p-1 bg-zinc-900">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors disabled:opacity-50"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-mono w-6 text-center text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-white font-bold text-sm">
                        ${(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 bg-zinc-900/50 border-t border-white/10 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-400">
                <span>{t("cart.subtotal")}</span>
                <span>${subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-white">
                <span>{t("cart.total")}</span>
                <span className="text-xl text-red-500">
                  ${subtotal.toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-gray-500">{t("cart.taxNotice")}</p>
            </div>
            <Button
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-6"
              onClick={handleCheckout}
              disabled={isLoading}
            >
              {isLoading
                ? t("common.processing", "Procesando...")
                : t("cart.checkout")}
            </Button>
            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
