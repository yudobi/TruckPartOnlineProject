import { memo, useState } from "react";
import { Package } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AddToCart } from "@/components/products/AddToCart";
import { type Product, type ProductCategory } from "@app-types/product";

// ─── Helper ───────────────────────────────────────────────────────────────────

const getCategoryName = (
  category: ProductCategory | string | undefined,
): string => {
  if (!category) return "";
  if (typeof category === "string") {
    return category;
  }
  if (typeof category === "object" && "name" in category) {
    return category.name || "";
  }
  return "";
};

// ─── Component ────────────────────────────────────────────────────────────────

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export const ProductCard = memo(function ProductCard({
  product,
  onSelect,
}: ProductCardProps) {
  const { t } = useTranslation();
  const { name, category, price, images, inventory } = product;
  const imageUrl =
    images?.find((img) => img.is_main)?.image || images?.[0]?.image;
  const numericPrice = parseFloat(price || "0");
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <div
      onClick={() => onSelect(product)}
      className="cursor-pointer rounded-sm group relative bg-zinc-900/40 border border-white/5 hover:border-red-600/50 transition-all duration-500 overflow-hidden"
      style={{ contain: "layout style paint" }}
      role="listitem"
    >
      <div
        className="aspect-square bg-zinc-900 flex items-center justify-center transition-transform duration-700 overflow-hidden relative"
        style={{ contain: "layout" }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            loading="lazy"
            decoding="auto"
            onLoad={() => setImgLoaded(true)}
            className={`w-full h-full object-cover group-hover:scale-110 transition-all duration-700 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
          />
        ) : (
          <Package
            width={65}
            height={65}
            className="opacity-10 group-hover:opacity-30 transition-opacity"
          />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
          <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">
            {t("catalog.viewDetails")}
          </span>
        </div>
        {(!inventory || inventory.quantity <= 0) && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[2px] z-10">
            <span className="px-6 py-2 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest border border-white/20 shadow-xl transform -rotate-12">
              {t("catalog.details.noStock")}
            </span>
          </div>
        )}
      </div>
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <span className="text-[10px] font-bold text-red-600 tracking-widest uppercase bg-red-600/10 px-2 py-0.5 rounded-xs">
            {getCategoryName(category) || "General"}
          </span>
          <span className="text-[10px] text-gray-600 font-mono">
            #{product.id.toString().padStart(3, "0")}
          </span>
        </div>
        <h3 className="text-lg font-bold text-white mb-6 group-hover:text-red-500 transition-colors line-clamp-2 min-h-14 leading-snug">
          {name}
        </h3>
        <div className="flex justify-between items-center pt-4 border-t border-white/5">
          <span className="text-xl font-light text-white">
            ${numericPrice.toLocaleString()}
          </span>
          <AddToCart product={product} variant="card" />
        </div>
      </div>
    </div>
  );
});

export default ProductCard;
