import { useState } from "react";
import { Plus, ShoppingCart, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@hooks/useCart";
import { type Product } from "@app-types/product";
import { cn } from "@/lib/utils";

interface AddToCartProps {
  product: Product;
  variant?: "card" | "detail";
  className?: string;
  onAdd?: () => void;
}

export function AddToCart({
  product,
  variant = "card",
  className,
  onAdd,
}: AddToCartProps) {
  const { addItem, items } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  // Check if item is in cart
  const cartItem = items.find((item) => item.id === product.id);
  const quantityInCart = cartItem?.quantity || 0;

  // Check stock
  const isOutOfStock = product.inventory.quantity <= 0;
  // Check if we can add more (inventory limit)
  const canAdd = !isOutOfStock && quantityInCart < product.inventory.quantity;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!canAdd) return;

    setIsAdding(true);

    // Simulate a small delay for better UX (feedback)
    // In a real app, addItem might be async if it talks to an API,
    // but here it's local state. We add a fake delay to show the spinner/loading state.
    setTimeout(() => {
      addItem(product);
      setIsAdding(false);
      setJustAdded(true);

      // Reset "Just Added" state after 2 seconds
      setTimeout(() => setJustAdded(false), 2000);

      if (onAdd) onAdd();
    }, 500);
  };

  if (variant === "card") {
    return (
      <button
        onClick={handleAdd}
        disabled={!canAdd || isAdding}
        className={cn(
          "w-10 h-10 flex items-center justify-center transition-all duration-300 relative overflow-hidden group/btn",
          canAdd
            ? "bg-white text-black hover:bg-red-600 hover:text-white"
            : "bg-zinc-800 text-zinc-600 cursor-not-allowed",
          justAdded && "bg-green-500 text-white hover:bg-green-600",
          className,
        )}
        title={
          isOutOfStock
            ? "Agotado"
            : !canAdd
              ? "Máximo disponible alcanzado"
              : "Agregar al carrito"
        }
      >
        {isAdding ? (
          <Loader2 className="animate-spin w-5 h-5" />
        ) : justAdded ? (
          <Check className="w-5 h-5" />
        ) : (
          <div className="relative">
            <Plus size={20} />
            {quantityInCart > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 bg-red-600 group-hover/btn:bg-white rounded-full border border-black group-hover/btn:border-red-600 transition-colors" />
            )}
          </div>
        )}
      </button>
    );
  }

  // Detail variant
  return (
    <Button
      className={cn(
        "flex-1 h-14 text-lg font-bold transition-all duration-300",
        justAdded
          ? "bg-green-600 hover:bg-green-700 text-white"
          : "bg-white text-black hover:bg-red-600 hover:text-white",
        className,
      )}
      onClick={handleAdd}
      disabled={!canAdd || isAdding}
    >
      {isAdding ? (
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
      ) : justAdded ? (
        <Check className="mr-2 h-5 w-5" />
      ) : (
        <ShoppingCart className="mr-2 h-5 w-5" />
      )}

      {isOutOfStock
        ? "AGOTADO"
        : !canAdd
          ? "MÁXIMO ALCANZADO"
          : justAdded
            ? "AGREGADO"
            : quantityInCart > 0
              ? `AGREGAR (+${quantityInCart} EN CARRITO)`
              : "AGREGAR AL CARRITO"}
    </Button>
  );
}
