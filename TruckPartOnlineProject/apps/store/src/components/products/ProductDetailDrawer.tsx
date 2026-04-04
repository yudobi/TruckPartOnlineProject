import { useState, useEffect } from "react";
import { Package } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AddToCart } from "@/components/products/AddToCart";
import {
  Drawer,
  DrawerContent,
  DrawerClose,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
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

// ─── Props ────────────────────────────────────────────────────────────────────

interface ProductDetailDrawerProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  activeImage: string | null;
  onImageChange: (image: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ProductDetailDrawer({
  product,
  isOpen,
  onClose,
  activeImage,
  onImageChange,
}: ProductDetailDrawerProps) {
  const { t } = useTranslation();
  const [mainImgLoaded, setMainImgLoaded] = useState(false);

  useEffect(() => {
    setMainImgLoaded(false);
  }, [activeImage]);

  return (
    <Drawer
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DrawerContent className="bg-neutral-950 border-white/10 text-white max-h-[95vh]">
        {product && (
          <div className="mx-auto w-full max-w-5xl overflow-y-auto">
            <div className="p-8 lg:p-12">
              <div className="grid lg:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <div className="aspect-square bg-zinc-900 border border-white/5 flex items-center justify-center overflow-hidden rounded-sm group relative">
                    {activeImage ? (
                      <img
                        src={activeImage}
                        alt={product.name}
                        loading="lazy"
                        decoding="auto"
                        onLoad={() => setMainImgLoaded(true)}
                        className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${mainImgLoaded ? "opacity-100" : "opacity-0"}`}
                      />
                    ) : (
                      <Package size={100} className="text-white/5" />
                    )}
                    <div className="absolute top-4 right-4 px-3 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-black tracking-widest text-white uppercase">
                      {product.sku || "PRO-TRUCK"}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    {product.images.map((img) => (
                      <div
                        key={img.id}
                        onClick={() => onImageChange(img.image)}
                        className={`aspect-square bg-zinc-900 border rounded-sm overflow-hidden transition-all cursor-pointer ${
                          activeImage === img.image
                            ? "border-red-600 ring-2 ring-red-600/20"
                            : "border-white/5 opacity-40 hover:opacity-100 hover:border-white/20"
                        }`}
                      >
                        <img
                          src={img.image}
                          alt=""
                          loading="lazy"
                          decoding="auto"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="px-2 py-0.5 bg-red-600 text-[10px] font-black text-white uppercase tracking-tighter rounded-xs">
                        {getCategoryName(product.category) || "General"}
                      </span>
                      <div className="h-px flex-1 bg-white/10"></div>
                    </div>
                    <DrawerTitle className="text-4xl lg:text-5xl font-black tracking-tighter text-white mb-6 leading-[0.9]">
                      {product.name}
                    </DrawerTitle>
                    <div className="flex items-baseline gap-4 mb-8">
                      <span className="text-5xl font-light text-white">
                        ${parseFloat(product.price).toLocaleString()}
                      </span>
                      <span
                        className={`text-sm font-bold uppercase tracking-widest ${
                          (product.inventory?.quantity || 0) > 0
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        {(product.inventory?.quantity || 0) > 0
                          ? `✓ ${product.inventory?.quantity} ${t("catalog.details.stock")}`
                          : `✕ ${t("catalog.details.noStock")}`}
                      </span>
                    </div>
                    <div className="space-y-6 mb-12">
                      <p className="text-gray-400 leading-relaxed text-lg">
                        {product.description ||
                          t("catalog.details.descriptionDefault")}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pb-8 border-b border-white/5">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                          {t("catalog.details.id")}
                        </span>
                        <p className="text-sm font-mono text-white">
                          #{product.id.toString().padStart(6, "0")}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                          {t("catalog.details.category")}
                        </span>
                        <p className="text-sm text-white">
                          {getCategoryName(product.category) || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="pt-8 flex gap-4">
                    <div className="flex-1">
                      <AddToCart product={product} variant="detail" />
                    </div>
                    <DrawerClose asChild>
                      <Button
                        variant="outline"
                        className="h-14 px-8 border-white/10 hover:bg-white/5 text-gray-400 font-bold uppercase tracking-widest text-xs"
                      >
                        {t("catalog.details.close")}
                      </Button>
                    </DrawerClose>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}

export default ProductDetailDrawer;
