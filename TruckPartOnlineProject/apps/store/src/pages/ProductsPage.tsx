import {
  Package,
  Filter,
  X,
  SlidersHorizontal,
  Clock,
  ArrowDown01,
  ArrowUp01,
  ArrowDownAZ,
  ArrowUpAZ,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  type CategoryFilterValue,
  type CategoryFilterNode,
} from "@/components/category/category-filter";

import { type Product } from "@app-types/product";
import { useProducts } from "@hooks/useProducts";
import { useState, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router";
import { useCategoriesWithSubcategories } from "@hooks/useCategories";
import { useBrands } from "@hooks/useBrands";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { ProductCard } from "@/components/products/ProductCard";
import { ProductSkeleton } from "@/components/products/ProductSkeleton";
import { ProductFilters } from "@/components/products/ProductFilters";
import { ProductPagination } from "@/components/products/ProductPagination";
import { ProductDetailDrawer } from "@/components/products/ProductDetailDrawer";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Construye un mapa: nodeId → Set de todos sus IDs descendientes (incluyéndose a sí mismo).
 * Así podemos saber rápidamente si un producto con category.id=X pertenece
 * a un nodo padre seleccionado con id=Y.
 *
 * Ejemplo: nodo 22 (Aceites) → { 22, 23, 24, 33 }
 */
function buildDescendantMap(
  nodes: CategoryFilterNode[],
  map: Map<number, Set<number>> = new Map(),
): Map<number, Set<number>> {
  for (const node of nodes) {
    // Recopilar todos los IDs descendientes de este nodo
    const descendants = new Set<number>();
    collectIds(node, descendants);
    map.set(node.id, descendants);

    // Recursivo para los hijos
    if (node.children?.length) {
      buildDescendantMap(node.children, map);
    }
  }
  return map;
}

function collectIds(node: CategoryFilterNode, acc: Set<number>): void {
  acc.add(node.id);
  node.children?.forEach((c) => collectIds(c, acc));
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProductsPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const manufacturerParam = searchParams.get("manufacturer");
  const searchParam = searchParams.get("search");
  const minPriceParam = searchParams.get("minPrice");
  const maxPriceParam = searchParams.get("maxPrice");
  const pageParam = searchParams.get("page");
  const currentPage = pageParam ? parseInt(pageParam, 10) : 1;

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isChangingPage, setIsChangingPage] = useState(false);
  const [sortBy, setSortBy] = useState<string>("recent");

  // ── Filtro de categorías vive en estado React, NO en la URL ────────────────
  // Esto evita serializar/deserializar IDs y hace el filtrado directo y correcto.
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilterValue>({
    category_ids: [],
    subcategory_ids: [],
    system_ids: [],
    piece_ids: [],
  });

  const { data: productsData, isLoading, isError } = useProducts();
  const {
    data: apiCategories,
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
  } = useCategoriesWithSubcategories();
  const {
    data: brands,
    isLoading: isBrandsLoading,
    isError: isBrandsError,
  } = useBrands();

  /**
   * Mapa precalculado: cada nodo del árbol → Set de todos sus descendientes.
   * Se recalcula solo cuando cambian las categorías del API.
   */
  const descendantMap = useMemo(
    () => buildDescendantMap(apiCategories ?? []),
    [apiCategories],
  );

  /**
   * Set unificado de todos los IDs de categoria seleccionados en el filtro
   * (de cualquier nivel). Un producto pasa el filtro si su category.id está
   * en los descendientes de ALGUNO de estos IDs.
   */
  const selectedCategoryIds = useMemo(() => {
    return new Set([
      ...categoryFilter.category_ids,
      ...categoryFilter.subcategory_ids,
      ...categoryFilter.system_ids,
      ...categoryFilter.piece_ids,
    ]);
  }, [categoryFilter]);

  // Filtrado y ordenamiento en el cliente
  const filteredAndSortedProducts = useMemo(() => {
    if (!productsData?.results) return [];

    const isCategoryFilterActive = selectedCategoryIds.size > 0;

    const filtered = productsData.results.filter((product) => {
      // ── Filtro de categoría (via árbol jerárquico) ─────────────────────────
      // FIX: Antes se descartaban todos los productos cuya category era string,
      // ahora se resuelve el string a un ID numérico antes de comparar.
      if (isCategoryFilterActive) {
        const cat = product.category;
        if (!cat) return false;

        let productCategoryId: number | undefined;

        if (typeof cat === "object") {
          // Caso normal: la API devolvió el objeto completo { id, name, ... }
          productCategoryId = cat.id;
        } else if (typeof cat === "string") {
          // La API devolvió solo un string — intentar parsearlo como ID numérico
          const parsed = parseInt(cat, 10);
          if (!isNaN(parsed)) {
            productCategoryId = parsed;
          }
          // Si es un slug no resoluble a número, el producto no pasa el filtro
        }

        if (productCategoryId === undefined) return false;

        let matched = false;
        for (const selectedId of selectedCategoryIds) {
          if (descendantMap.get(selectedId)?.has(productCategoryId)) {
            matched = true;
            break;
          }
        }
        if (!matched) return false;
      }

      // Fabricante
      if (manufacturerParam) {
        const productBrandId = product.brand?.id?.toString() || "";
        const productBrandName = product.brand?.name || "";
        const productManufacturer = product.manufacturer || "";
        
        const normalize = (s: string) =>
          s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
        
        // Comparar por ID (si manufacturerParam es un número) o por nombre
        const isNumericId = /^\d+$/.test(manufacturerParam);
        
        if (isNumericId) {
          // Comparar por ID
          if (productBrandId !== manufacturerParam) {
            return false;
          }
        } else {
          // Comparar por nombre (para compatibilidad con filtros antiguos)
          if (
            normalize(productBrandName) !== normalize(manufacturerParam) &&
            normalize(productManufacturer) !== normalize(manufacturerParam)
          ) {
            return false;
          }
        }
      }

      // Búsqueda por texto
      if (searchParam) {
        const q = searchParam.toLowerCase();
        if (
          !product.name?.toLowerCase().includes(q) &&
          !product.description?.toLowerCase().includes(q) &&
          !product.sku?.toLowerCase().includes(q)
        ) {
          return false;
        }
      }

      // Precio mínimo
      if (minPriceParam && Number(product.price) < Number(minPriceParam)) {
        return false;
      }

      // Precio máximo
      if (maxPriceParam && Number(product.price) > Number(maxPriceParam)) {
        return false;
      }

      return true;
    });

    // Ordenamiento
    switch (sortBy) {
      case "price-asc":
        filtered.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case "price-desc":
        filtered.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case "name-asc":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        break;
    }

    return filtered;
  }, [
    productsData,
    selectedCategoryIds,
    descendantMap,
    manufacturerParam,
    searchParam,
    minPriceParam,
    maxPriceParam,
    sortBy,
  ]);

  // Paginación
  const ITEMS_PER_PAGE = 12;
  const totalCount = filteredAndSortedProducts.length;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = filteredAndSortedProducts.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  const handleFilterChange = useCallback(
    (key: string, value: string | undefined) => {
      const newParams = new URLSearchParams(searchParams);
      if (value) newParams.set(key, value);
      else newParams.delete(key);
      if (key !== "page") newParams.delete("page");
      setSearchParams(newParams);
    },
    [searchParams, setSearchParams],
  );

  const handleCategoryFilterChange = useCallback(
    (value: CategoryFilterValue) => {
      setCategoryFilter(value);
      // Resetear página al cambiar categoría
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("page");
      setSearchParams(newParams);
    },
    [searchParams, setSearchParams],
  );

  const clearCategoryFilter = useCallback(() => {
    setCategoryFilter({
      category_ids: [],
      subcategory_ids: [],
      system_ids: [],
      piece_ids: [],
    });
  }, []);

  const getBrandDisplayNameFromId = (id: string | null): string => {
    if (!id) return "";
    const brand = brands?.find((b) => b.id.toString() === id);
    return brand?.name || id;
  };

  const handlePageChange = useCallback(
    (page: number) => {
      setIsChangingPage(true);
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.set("page", page.toString());
        return newParams;
      });
      setTimeout(() => setIsChangingPage(false), 500);
    },
    [setSearchParams],
  );

  const handleProductSelect = useCallback((product: Product) => {
    setSelectedProduct(product);
    const mainImg =
      product.images?.find((img) => img.is_main)?.image ||
      product.images?.[0]?.image;
    setActiveImage(mainImg || null);
  }, []);

  const handleDrawerClose = useCallback(() => {
    setSelectedProduct(null);
    setActiveImage(null);
  }, []);

  const clearFilters = useCallback(() => {
    clearCategoryFilter();
    setSearchParams(new URLSearchParams());
  }, [clearCategoryFilter, setSearchParams]);

  // Nombre del filtro de categoría activo (para el chip en el header)
  const activeCategoryLabel = useMemo(() => {
    if (selectedCategoryIds.size === 0) return null;
    const count = selectedCategoryIds.size;
    return count === 1
      ? (() => {
          const id = [...selectedCategoryIds][0];
          // Buscar nombre en el árbol
          const flat = (nodes: CategoryFilterNode[]): CategoryFilterNode | undefined => {
            for (const n of nodes) {
              if (n.id === id) return n;
              const found = flat(n.children ?? []);
              if (found) return found;
            }
          };
          return flat(apiCategories ?? [])?.name ?? `ID ${id}`;
        })()
      : `${count} categorías`;
  }, [selectedCategoryIds, apiCategories]);

  return (
    <div className="min-h-screen bg-black pt-20 scroll-smooth">
      <div className="container mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden flex items-center justify-between mb-8">
            <h1 className="text-3xl font-black tracking-tighter text-white">
              {t("catalog.title")}
            </h1>
            <Button
              variant="outline"
              className="border-white/10 text-white"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Filter className="w-4 h-4 mr-2" />
              {t("catalog.filters.title") || "Filtros"}
            </Button>
          </div>

          {/* Sidebar */}
          <aside
            className={`
              fixed inset-0 z-50 lg:sticky lg:top-24 lg:z-0 lg:block lg:self-start
              ${isSidebarOpen ? "block" : "hidden"}
              lg:w-80 transition-all duration-300
            `}
          >
            <div
              className="absolute inset-0 bg-black/80 backdrop-blur-sm lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
            <div className="absolute right-0 top-0 bottom-0 w-80 bg-zinc-950 border-l border-white/10 p-8 lg:bg-transparent lg:border-l-0 lg:p-0 lg:relative overflow-y-auto max-h-screen lg:max-h-[calc(100vh-10rem)] sidebar-scroll">
              <div className="flex items-center justify-between mb-8 lg:hidden">
                <span className="text-xl font-bold text-white">
                  {t("catalog.filters.title")}
                </span>
                <X
                  className="w-6 h-6 text-white cursor-pointer"
                  onClick={() => setIsSidebarOpen(false)}
                />
              </div>

              <ProductFilters
                searchTerm={searchParam || ""}
                onSearchChange={(value) => handleFilterChange("search", value)}
                apiCategories={apiCategories}
                isCategoriesLoading={isCategoriesLoading}
                isCategoriesError={isCategoriesError}
                onCategoryFilterChange={handleCategoryFilterChange}
                brands={brands}
                isBrandsLoading={isBrandsLoading}
                isBrandsError={isBrandsError}
                selectedBrand={manufacturerParam}
                onBrandChange={(brandId) =>
                  handleFilterChange("manufacturer", brandId)
                }
                onBrandClear={() =>
                  handleFilterChange("manufacturer", undefined)
                }
                minPrice={minPriceParam || ""}
                maxPrice={maxPriceParam || ""}
                onMinPriceChange={(value) =>
                  handleFilterChange("minPrice", value)
                }
                onMaxPriceChange={(value) =>
                  handleFilterChange("maxPrice", value)
                }
                onClearAll={clearFilters}
              />
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <header className="hidden lg:block mb-12">
              <div className="flex items-center gap-4 mb-4">
                <span className="h-px w-12 bg-red-600"></span>
                <span className="text-xs font-bold tracking-[0.3em] text-red-600 uppercase">
                  {t("catalog.subtitle")}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white leading-none">
                {t("catalog.title")}
              </h1>

              {/* Active Filters chips */}
              {(activeCategoryLabel ||
                manufacturerParam ||
                minPriceParam ||
                maxPriceParam ||
                searchParam) && (
                <div className="flex flex-wrap gap-2 mt-8">
                  {activeCategoryLabel && (
                    <ActiveFilter
                      label={activeCategoryLabel}
                      onClear={clearCategoryFilter}
                    />
                  )}
                  {manufacturerParam && (
                    <ActiveFilter
                      label={getBrandDisplayNameFromId(manufacturerParam)}
                      onClear={() =>
                        handleFilterChange("manufacturer", undefined)
                      }
                    />
                  )}
                  {minPriceParam && (
                    <ActiveFilter
                      label={`>${minPriceParam}`}
                      onClear={() => handleFilterChange("minPrice", undefined)}
                    />
                  )}
                  {maxPriceParam && (
                    <ActiveFilter
                      label={`<${maxPriceParam}`}
                      onClear={() => handleFilterChange("maxPrice", undefined)}
                    />
                  )}
                  {searchParam && (
                    <ActiveFilter
                      label={`"${searchParam}"`}
                      onClear={() => handleFilterChange("search", undefined)}
                    />
                  )}
                </div>
              )}
            </header>

            {/* Results Info */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
              <div className="text-gray-500 text-sm">
                {isLoading ? (
                  t("catalog.loading")
                ) : (
                  <>
                    {t("catalog.showing")}{" "}
                    <span className="text-white font-bold">{totalCount}</span>{" "}
                    {t("catalog.productsCount")}
                  </>
                )}
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>{t("catalog.sortBy")}:</span>
                </div>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white w-48" aria-label="Ordenar productos">
                    <SelectValue placeholder={t("catalog.sortBy")} />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-950 border-white/10 text-white">
                    <SelectItem value="recent" className="cursor-pointer hover:bg-red-600 hover:text-white focus:bg-red-600 focus:text-white">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-red-500" />
                        <span>{t("catalog.sortOptions.recent", "Más Recientes")}</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="price-asc" className="cursor-pointer hover:bg-red-600 hover:text-white focus:bg-red-600 focus:text-white">
                      <div className="flex items-center gap-2">
                        <ArrowDown01 className="w-4 h-4 text-red-500" />
                        <span>{t("catalog.sortOptions.priceAsc", "Precio: Menor a Mayor")}</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="price-desc" className="cursor-pointer hover:bg-red-600 hover:text-white focus:bg-red-600 focus:text-white">
                      <div className="flex items-center gap-2">
                        <ArrowUp01 className="w-4 h-4 text-red-500" />
                        <span>{t("catalog.sortOptions.priceDesc", "Precio: Mayor a Menor")}</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="name-asc" className="cursor-pointer hover:bg-red-600 hover:text-white focus:bg-red-600 focus:text-white">
                      <div className="flex items-center gap-2">
                        <ArrowDownAZ className="w-4 h-4 text-red-500" />
                        <span>{t("catalog.sortOptions.nameAsc", "Nombre: A - Z")}</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="name-desc" className="cursor-pointer hover:bg-red-600 hover:text-white focus:bg-red-600 focus:text-white">
                      <div className="flex items-center gap-2">
                        <ArrowUpAZ className="w-4 h-4 text-red-500" />
                        <span>{t("catalog.sortOptions.nameDesc", "Nombre: Z - A")}</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Grid */}
            <div
              className={`grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 transition-opacity duration-300 ${isChangingPage ? "opacity-50" : ""}`}
              style={{ contain: "layout style paint" }}
              role="list"
              aria-label="Lista de productos"
            >
              {isLoading || isChangingPage ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <ProductSkeleton key={i} />
                ))
              ) : isError ? (
                <div className="col-span-full py-20 text-center bg-zinc-900/50 border border-white/10 rounded-sm">
                  <p className="text-red-500 font-bold mb-4">{t("catalog.error")}</p>
                  <Button
                    onClick={() => window.location.reload()}
                    className="bg-white text-black hover:bg-red-600 hover:text-white"
                  >
                    {t("catalog.retry")}
                  </Button>
                </div>
              ) : paginatedProducts.length === 0 ? (
                <div className="col-span-full py-32 text-center bg-zinc-900/20 border border-dashed border-white/10 rounded-sm">
                  <Package size={48} className="mx-auto text-gray-700 mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">
                    {t("catalog.noProducts")}
                  </h3>
                  <p className="text-gray-500 max-w-xs mx-auto">
                    {t("catalog.noProductsDesc")}
                  </p>
                  <Button
                    variant="link"
                    className="mt-4 text-red-500 font-bold"
                    onClick={clearFilters}
                  >
                    {t("catalog.clearAll")}
                  </Button>
                </div>
              ) : (
                paginatedProducts.map((product: Product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelect={handleProductSelect}
                  />
                ))
              )}
            </div>

            {/* Pagination */}
            {totalCount > 0 && (
              <div className="mt-12 flex justify-center">
                <ProductPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Product Drawer */}
      <ProductDetailDrawer
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={handleDrawerClose}
        activeImage={activeImage}
        onImageChange={setActiveImage}
      />
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ActiveFilter({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-red-600/10 border border-red-600/30 rounded-full text-xs font-bold text-red-500">
      <span>{label}</span>
      <X className="w-3 h-3 cursor-pointer hover:text-red-400" onClick={onClear} />
    </div>
  );
}
