import {
  Package,
  Search,
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
import { AddToCart } from "@/components/products/AddToCart";
import CategoryFilter, {
  type CategoryFilterValue,
  type CategoryFilterNode,
} from "@/components/category/category-filter";

import { type Product, type ProductCategory } from "@app-types/product";
import { useProducts } from "@hooks/useProducts";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useMemo } from "react";
import { useSearchParams } from "react-router";
import { useCategoriesWithSubcategories } from "@hooks/useCategories";
import { useBrands } from "@hooks/useBrands";

import {
  Drawer,
  DrawerContent,
  DrawerClose,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getCategoryName = (
  category: ProductCategory | string | undefined,
): string => {
  if (!category) return "";
  if (typeof category === "string") {
    // Si la API devuelve un string, se usa directamente como nombre
    return category;
  }
  if (typeof category === "object" && "name" in category) {
    return category.name || "";
  }
  return "";
};

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
        const productBrand = product.brand?.name || "";
        const productManufacturer = product.manufacturer || "";
        const normalize = (s: string) =>
          s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
        if (
          normalize(productBrand) !== normalize(manufacturerParam) &&
          normalize(productManufacturer) !== normalize(manufacturerParam)
        ) {
          return false;
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

  const handleFilterChange = (key: string, value: string | undefined) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) newParams.set(key, value);
    else newParams.delete(key);
    if (key !== "page") newParams.delete("page");
    setSearchParams(newParams);
  };

  const handleCategoryFilterChange = (value: CategoryFilterValue) => {
    setCategoryFilter(value);
    // Resetear página al cambiar categoría
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("page");
    setSearchParams(newParams);
  };

  const clearCategoryFilter = () => {
    setCategoryFilter({
      category_ids: [],
      subcategory_ids: [],
      system_ids: [],
      piece_ids: [],
    });
  };

  const getBrandDisplayNameFromId = (id: string | null): string => {
    if (!id) return "";
    const brand = brands?.find((b) => b.id.toString() === id);
    return brand?.name || id;
  };


  const handlePageChange = (page: number) => {
    setIsChangingPage(true);
    handleFilterChange("page", page.toString());
    setTimeout(() => setIsChangingPage(false), 500);
  };

  const clearFilters = () => {
    clearCategoryFilter();
    setSearchParams(new URLSearchParams());
  };

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

              <div className="space-y-10">
                {/* Search */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold tracking-widest text-gray-500 uppercase">
                    {t("catalog.filters.search")}
                  </h3>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input
                      placeholder={t("catalog.filters.searchPlaceholder")}
                      className="bg-white/5 border-white/10 text-white pl-10 h-12 focus:border-red-600 transition-colors"
                      value={searchParam || ""}
                      onChange={(e) =>
                        handleFilterChange("search", e.target.value)
                      }
                    />
                  </div>
                </div>

                {/* Categories */}
                {isCategoriesLoading ? (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold tracking-widest text-gray-500 uppercase">
                      {t("catalog.filters.categories")}
                    </h3>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : isCategoriesError ? (
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold tracking-widest text-gray-500 uppercase">
                      {t("catalog.filters.categories")}
                    </h3>
                    <div className="text-red-500 text-sm">
                      Error al cargar categorías
                    </div>
                  </div>
                ) : apiCategories && apiCategories.length > 0 ? (
                  <CategoryFilter
                    tree={apiCategories}
                    onChange={handleCategoryFilterChange}
                  />
                ) : (
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold tracking-widest text-gray-500 uppercase">
                      {t("catalog.filters.categories")}
                    </h3>
                    <p className="text-gray-500 text-sm">
                      No hay categorías disponibles
                    </p>
                  </div>
                )}

                {/* Manufacturers */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold tracking-widest text-gray-500 uppercase">
                      {t("catalog.filters.manufacturers")}
                    </h3>
                    {manufacturerParam && (
                      <button
                        onClick={() =>
                          handleFilterChange("manufacturer", undefined)
                        }
                        className="text-[10px] font-bold text-red-500 hover:text-red-400 uppercase tracking-tighter"
                      >
                        {t("catalog.filters.clear")}
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {isBrandsLoading && (
                      <div className="text-gray-500 text-sm">
                        Cargando fabricantes...
                      </div>
                    )}
                    {isBrandsError && (
                      <div className="text-red-500 text-sm">
                        Error al cargar fabricantes
                      </div>
                    )}
                    {!isBrandsLoading &&
                      !isBrandsError &&
                      brands?.map((brand) => (
                        <button
                          key={brand.id}
                          onClick={() =>
                            handleFilterChange(
                              "manufacturer",
                              brand.id.toString(),
                            )
                          }
                          className={`
                            px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase border rounded-xs transition-all
                            ${
                              manufacturerParam === brand.id.toString()
                                ? "bg-red-600 border-red-600 text-white"
                                : "bg-white/5 border-white/10 text-gray-400 hover:border-white/30 hover:text-white"
                            }
                          `}
                        >
                          {brand.name}
                        </button>
                      ))}
                    {!isBrandsLoading &&
                      !isBrandsError &&
                      brands?.length === 0 && (
                        <div className="text-gray-500 text-sm">
                          No hay fabricantes disponibles
                        </div>
                      )}
                  </div>
                </div>

                {/* Price Range */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold tracking-widest text-gray-500 uppercase">
                    {t("catalog.filters.price")}
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      placeholder="Min"
                      type="number"
                      className="bg-white/5 border-white/10 text-white h-10 text-sm"
                      value={minPriceParam || ""}
                      onChange={(e) =>
                        handleFilterChange("minPrice", e.target.value)
                      }
                    />
                    <Input
                      placeholder="Max"
                      type="number"
                      className="bg-white/5 border-white/10 text-white h-10 text-sm"
                      value={maxPriceParam || ""}
                      onChange={(e) =>
                        handleFilterChange("maxPrice", e.target.value)
                      }
                    />
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full border-red-600/20 text-gray-400 hover:bg-red-600 hover:text-white transition-all text-xs font-bold tracking-widest uppercase"
                  onClick={clearFilters}
                >
                  <X className="w-4 h-4 mr-2" />
                  {t("catalog.filters.clear")}
                </Button>
              </div>
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
                  <SelectTrigger className="bg-white/5 border-white/10 text-white w-48">
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
                    onSelect={() => {
                      setSelectedProduct(product);
                      const mainImg =
                        product.images?.find((img) => img.is_main)?.image ||
                        product.images?.[0]?.image;
                      setActiveImage(mainImg || null);
                    }}
                  />
                ))
              )}
            </div>

            {/* Pagination */}
            {totalCount > 0 && (
              <div className="mt-12 flex justify-center">
                <PaginationComponent
                  currentPage={currentPage}
                  totalCount={totalCount}
                  totalPages={totalPages}
                  hasNext={currentPage < totalPages}
                  hasPrevious={currentPage > 1}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Product Drawer */}
      <Drawer
        open={!!selectedProduct}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedProduct(null);
            setActiveImage(null);
          }
        }}
      >
        <DrawerContent className="bg-neutral-950 border-white/10 text-white max-h-[95vh]">
          {selectedProduct && (
            <div className="mx-auto w-full max-w-5xl overflow-y-auto">
              <div className="p-8 lg:p-12">
                <div className="grid lg:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <div className="aspect-square bg-zinc-900 border border-white/5 flex items-center justify-center overflow-hidden rounded-sm group relative">
                      {activeImage ? (
                        <img
                          src={activeImage}
                          alt={selectedProduct.name}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <Package size={100} className="text-white/5" />
                      )}
                      <div className="absolute top-4 right-4 px-3 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-black tracking-widest text-white uppercase">
                        {selectedProduct.sku || "PRO-TRUCK"}
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                      {selectedProduct.images.map((img) => (
                        <div
                          key={img.id}
                          onClick={() => setActiveImage(img.image)}
                          className={`aspect-square bg-zinc-900 border rounded-sm overflow-hidden transition-all cursor-pointer ${
                            activeImage === img.image
                              ? "border-red-600 ring-2 ring-red-600/20"
                              : "border-white/5 opacity-40 hover:opacity-100 hover:border-white/20"
                          }`}
                        >
                          <img src={img.image} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <span className="px-2 py-0.5 bg-red-600 text-[10px] font-black text-white uppercase tracking-tighter rounded-xs">
                          {getCategoryName(selectedProduct.category) || "General"}
                        </span>
                        <div className="h-px flex-1 bg-white/10"></div>
                      </div>
                      <DrawerTitle className="text-4xl lg:text-5xl font-black tracking-tighter text-white mb-6 leading-[0.9]">
                        {selectedProduct.name}
                      </DrawerTitle>
                      <div className="flex items-baseline gap-4 mb-8">
                        <span className="text-5xl font-light text-white">
                          ${parseFloat(selectedProduct.price).toLocaleString()}
                        </span>
                        <span className={`text-sm font-bold uppercase tracking-widest ${(selectedProduct.inventory?.quantity || 0) > 0 ? "text-green-500" : "text-red-500"}`}>
                          {(selectedProduct.inventory?.quantity || 0) > 0
                            ? `✓ ${selectedProduct.inventory?.quantity} ${t("catalog.details.stock")}`
                            : `✕ ${t("catalog.details.noStock")}`}
                        </span>
                      </div>
                      <div className="space-y-6 mb-12">
                        <p className="text-gray-400 leading-relaxed text-lg">
                          {selectedProduct.description || t("catalog.details.descriptionDefault")}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pb-8 border-b border-white/5">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t("catalog.details.id")}</span>
                          <p className="text-sm font-mono text-white">#{selectedProduct.id.toString().padStart(6, "0")}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t("catalog.details.category")}</span>
                          <p className="text-sm text-white">{getCategoryName(selectedProduct.category) || "N/A"}</p>
                        </div>
                      </div>
                    </div>
                    <div className="pt-8 flex gap-4">
                      <div className="flex-1">
                        <AddToCart product={selectedProduct} variant="detail" />
                      </div>
                      <DrawerClose asChild>
                        <Button variant="outline" className="h-14 px-8 border-white/10 hover:bg-white/5 text-gray-400 font-bold uppercase tracking-widest text-xs">
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

function ProductCard({ product, onSelect }: { product: Product; onSelect: () => void }) {
  const { t } = useTranslation();
  const { name, category, price, images, inventory } = product;
  const imageUrl = images?.find((img) => img.is_main)?.image || images?.[0]?.image;
  const numericPrice = parseFloat(price || "0");

  return (
    <div
      onClick={onSelect}
      className="cursor-pointer rounded-sm group relative bg-zinc-900/40 border border-white/5 hover:border-red-600/50 transition-all duration-500 overflow-hidden"
      style={{ contain: "layout style paint" }}
    >
      <div className="aspect-square bg-zinc-900 flex items-center justify-center transition-transform duration-700 overflow-hidden relative" style={{ contain: "layout" }}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 will-change-transform"
          />
        ) : (
          <Package width={65} height={65} className="opacity-10 group-hover:opacity-30 transition-opacity" />
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
          <span className="text-xl font-light text-white">${numericPrice.toLocaleString()}</span>
          <AddToCart product={product} variant="card" />
        </div>
      </div>
    </div>
  );
}

function PaginationComponent({
  currentPage,
  totalCount,
  totalPages,
  hasNext,
  hasPrevious,
  onPageChange,
}: {
  currentPage: number;
  totalCount: number;
  totalPages?: number;
  hasNext?: boolean;
  hasPrevious?: boolean;
  onPageChange: (page: number) => void;
}) {
  const calculatedTotalPages = totalPages || Math.ceil(totalCount / 12);
  if (calculatedTotalPages <= 1) return null;

  const getVisiblePages = () => {
    const delta = 2;
    const range: number[] = [];
    const rangeWithDots: (number | string)[] = [];
    let l: number | undefined;
    for (let i = 1; i <= calculatedTotalPages; i++) {
      if (i === 1 || i === calculatedTotalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }
    range.forEach((i) => {
      if (l) {
        if (i - l === 2) rangeWithDots.push(l + 1);
        else if (i - l !== 1) rangeWithDots.push("...");
      }
      rangeWithDots.push(i);
      l = i;
    });
    return rangeWithDots;
  };

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem className="text-red-500">
          <PaginationPrevious
            onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
            className={!hasPrevious && currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
          />
        </PaginationItem>
        {getVisiblePages().map((page, index) => (
          <PaginationItem className="text-red-500" key={index}>
            {page === "..." ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink
                onClick={() => onPageChange(page as number)}
                isActive={currentPage === page}
                className="cursor-pointer"
              >
                {page}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}
        <PaginationItem className="text-red-500">
          <PaginationNext
            onClick={() => currentPage < calculatedTotalPages && onPageChange(currentPage + 1)}
            className={!hasNext && currentPage === calculatedTotalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}