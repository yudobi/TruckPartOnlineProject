import { Package } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AddToCart } from "@/components/products/AddToCart";

import { type Product } from "@app-types/product";
import { useProducts } from "@hooks/useProducts";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";

export default function ProductsPage() {
  const { t } = useTranslation();
  const { data: products, isLoading, isError } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  return (
    <div className="container mx-auto px-6 py-20">
      <header className="mb-20">
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white mb-6">
          {t("catalog.title")}
        </h1>
        <div className="h-1 w-20 bg-red-600"></div>
      </header>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-12 border-b border-white/10 pb-8">
        <FilterButton active>{t("catalog.filters.all")}</FilterButton>
        <FilterButton>{t("catalog.filters.maintenance")}</FilterButton>
        <FilterButton>{t("catalog.filters.electric")}</FilterButton>
        <FilterButton>{t("catalog.filters.chassis")}</FilterButton>
      </div>

      {/* Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <ProductSkeleton key={i} />)
        ) : isError ? (
          <div className="col-span-full py-20 text-center">
            <p className="text-red-500 font-bold mb-4">
              Ocurrió un error al cargar los productos.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-white text-black font-bold hover:bg-red-600 hover:text-white transition-colors"
            >
              Reintentar
            </button>
          </div>
        ) : products?.results.length === 0 ? (
          <div className="col-span-full py-20 text-center text-gray-500">
            No se encontraron productos disponibles.
          </div>
        ) : (
          products?.results.map((product: Product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={() => {
                setSelectedProduct(product);
                const mainImg =
                  product.images.find((img) => img.is_main)?.image ||
                  product.images[0]?.image;
                setActiveImage(mainImg);
              }}
            />
          ))
        )}
      </div>

      <Drawer
        open={!!selectedProduct}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedProduct(null);
            setActiveImage(null);
          }
        }}
      >
        <DrawerContent className="bg-zinc-950 border-white/10 text-white max-h-[90vh]">
          {selectedProduct && (
            <div className="mx-auto w-full max-w-4xl overflow-y-auto">
              <DrawerHeader className="text-left border-b border-white/5 pb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold text-red-600 tracking-widest uppercase mb-2 block">
                      {selectedProduct.category || "General"}
                    </span>
                    <DrawerTitle className="text-3xl font-black tracking-tight text-white mb-2">
                      {selectedProduct.name}
                    </DrawerTitle>
                    <DrawerDescription className="text-gray-400 text-base">
                      SKU: {selectedProduct.sku || "N/A"}
                    </DrawerDescription>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-light text-white block">
                      ${parseFloat(selectedProduct.price).toLocaleString()}
                    </span>
                    <span className="text-sm text-green-500 font-medium">
                      {selectedProduct.inventory.quantity > 0
                        ? `${selectedProduct.inventory.quantity} en stock`
                        : "Sin stock"}
                    </span>
                  </div>
                </div>
              </DrawerHeader>

              <div className="p-6 grid md:grid-cols-2 gap-8">
                {/* Image Gallery */}
                <div className="space-y-4">
                  <div className="aspect-square bg-zinc-900 border border-white/5 flex items-center justify-center overflow-hidden">
                    {activeImage ? (
                      <img
                        src={activeImage}
                        alt={selectedProduct.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package size={80} className="text-white/10" />
                    )}
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {selectedProduct.images.map((img) => (
                      <div
                        key={img.id}
                        onClick={() => setActiveImage(img.image)}
                        className={`aspect-square bg-zinc-900 border overflow-hidden transition-all cursor-pointer ${
                          activeImage === img.image
                            ? "border-red-600 opacity-100"
                            : "border-white/5 opacity-50 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={img.image}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Details */}
                <div className="flex flex-col h-full">
                  <div className="flex-1">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">
                      Descripción
                    </h4>
                    <p className="text-gray-300 leading-relaxed text-lg mb-8">
                      {selectedProduct.description ||
                        "No hay descripción disponible para este producto."}
                    </p>

                    <div className="space-y-4 border-t border-white/5 pt-6">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">ID de Producto</span>
                        <span className="text-white font-mono">
                          #{selectedProduct.id}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">
                          Última actualización
                        </span>
                        <span className="text-white">
                          {new Date(
                            selectedProduct.updated_at,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <DrawerFooter className="border-t border-white/5 pt-6 flex-row gap-4 px-6 mb-4">
                <AddToCart product={selectedProduct} variant="detail" />
                <DrawerClose asChild>
                  <Button
                    variant="outline"
                    className="h-14 px-8 border-white/10 hover:bg-white/5 text-white"
                  >
                    Cerrar
                  </Button>
                </DrawerClose>
              </DrawerFooter>
            </div>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div className="rounded-sm bg-zinc-900/30 border border-white/10 overflow-hidden">
      <Skeleton className="aspect-4/3 w-full" />
      <div className="p-8 space-y-4">
        <div className="flex justify-between">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-12" />
        </div>
        <Skeleton className="h-6 w-3/4" />
        <div className="flex justify-between items-end border-t border-white/5 pt-6">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-10 w-10" />
        </div>
      </div>
    </div>
  );
}

function ProductCard({
  product,
  onSelect,
}: {
  product: Product;
  onSelect: () => void;
}) {
  const { name, category, price, images } = product;
  const imageUrl = images.find((img) => img.is_main)?.image || images[0]?.image;
  const numericPrice = parseFloat(price);

  return (
    <div
      onClick={onSelect}
      className="cursor-pointer rounded-sm group relative bg-zinc-900/30 border border-white/10 hover:border-red-600/50 transition-all duration-500 overflow-hidden"
    >
      {/* Image Container */}
      <div className="aspect-4/3 bg-zinc-800 flex items-center justify-center group-hover:scale-105 transition-transform duration-700 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <Package
            width={65}
            height={65}
            className="opacity-20 group-hover:opacity-40 transition-opacity"
          />
        )}
      </div>

      <div className="p-8">
        <div className="flex justify-between items-start mb-4">
          <span className="text-xs font-bold text-red-600 tracking-widest uppercase">
            {category || "General"}
          </span>
          <span className="text-xs text-gray-600 font-mono">
            #{product.id.toString().padStart(3, "0")}
          </span>
        </div>

        <h3 className="text-xl font-bold text-white mb-6 group-hover:text-red-500 transition-colors line-clamp-2 min-h-14">
          {name}
        </h3>

        <div className="flex justify-between items-end border-t border-white/5 pt-6">
          <span className="text-2xl font-light text-white">
            ${numericPrice.toLocaleString()}
          </span>
          <AddToCart product={product} variant="card" />
        </div>
      </div>
    </div>
  );
}

function FilterButton({
  children,
  active = false,
}: {
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <button
      className={`px-6 py-2 text-sm font-bold tracking-wider transition-all border ${
        active
          ? "bg-white text-black border-white"
          : "bg-transparent text-gray-400 border-transparent hover:border-white/20 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}
