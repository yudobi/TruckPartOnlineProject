import {
  Package,
  Search,
  Filter,
  X,
  ChevronRight,
  SlidersHorizontal,
  Clock,
  ArrowDown01,
  ArrowUp01,
  ArrowDownAZ,
  ArrowUpAZ,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { AddToCart } from "@/components/products/AddToCart";

import { type Product, type ProductCategory } from "@app-types/product";
import { useProducts } from "@hooks/useProducts";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useMemo } from "react";
import { useSearchParams } from "react-router";
import { useCategoriesWithSubcategories } from "@hooks/useCategories";
import { useBrands } from "@hooks/useBrands";
import {
  getCategoryDisplayName,
  getSubcategoryDisplayName,
  findCategoryByCode,
  getAllCategoriesFormatted,
} from "@lib/categoryHelpers";

// Helper para obtener el nombre de la categoría de forma segura
const getCategoryName = (
  category: ProductCategory | string | undefined,
): string => {
  if (!category) return "";
  if (typeof category === "string") {
    // Si es un código (A, B, C...), mostrar el nombre formateado
    const categoryInfo = findCategoryByCode(category);
    if (categoryInfo) return categoryInfo.shortName;
    return category;
  }
  // Ensure we always return a string, even if category is an object
  if (category && typeof category === "object" && "name" in category) {
    return category.name || "";
  }
  return "";
};

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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function ProductsPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const categoryParam = searchParams.get("category");
  const subcategoryParam = searchParams.get("subcategory");
  const manufacturerParam = searchParams.get("manufacturer");
  const searchParam = searchParams.get("search");
  const minPriceParam = searchParams.get("minPrice");
  const maxPriceParam = searchParams.get("maxPrice");
  const pageParam = searchParams.get("page");
  const currentPage = pageParam ? parseInt(pageParam, 10) : 1;

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(),
  );
  const [isChangingPage, setIsChangingPage] = useState(false);
  const [sortBy, setSortBy] = useState<string>("recent");

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

  // Obtener categorías disponibles desde los productos
  const availableCategories = useMemo(() => {
    if (!productsData?.results || !apiCategories) return [];

    const categoryMap = new Map<string, { count: number; name: string }>();

    productsData.results.forEach((product) => {
      const categoryName =
        typeof product.category === "string"
          ? product.category
          : product.category?.name;

      if (categoryName) {
        const existing = categoryMap.get(categoryName);
        if (existing) {
          existing.count++;
        } else {
          categoryMap.set(categoryName, { count: 1, name: categoryName });
        }
      }
    });

    return Array.from(categoryMap.entries()).map(([name, data]) => ({
      name,
      count: data.count,
      mappedCategory: apiCategories.find(
        (cat) =>
          cat.name?.toLowerCase() === name.toLowerCase() ||
          cat.code?.toLowerCase() === name.toLowerCase(),
      ),
    }));
  }, [productsData, apiCategories]);

  // Filtrado y ordenamiento en el cliente
  const filteredAndSortedProducts = useMemo(() => {
    if (!productsData?.results) return [];

    let filtered = [...productsData.results];

    // Aplicar filtros
    if (categoryParam) {
      filtered = filtered.filter((product) => {
        const categoryName =
          typeof product.category === "string"
            ? product.category
            : product.category?.name;
        return categoryName === categoryParam;
      });
    }

    if (subcategoryParam) {
      filtered = filtered.filter((product) => {
        // Filtrar por subcategoría directamente
        return product.subcategory === subcategoryParam;
      });
    }

    if (manufacturerParam) {
      filtered = filtered.filter(
        (product) => product.manufacturer === manufacturerParam,
      );
    }

    if (searchParam) {
      const searchLower = searchParam.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name?.toLowerCase().includes(searchLower) ||
          product.description?.toLowerCase().includes(searchLower) ||
          product.sku?.toLowerCase().includes(searchLower),
      );
    }

    if (minPriceParam) {
      const minPrice = Number(minPriceParam);
      filtered = filtered.filter(
        (product) => Number(product.price) >= minPrice,
      );
    }

    if (maxPriceParam) {
      const maxPrice = Number(maxPriceParam);
      filtered = filtered.filter(
        (product) => Number(product.price) <= maxPrice,
      );
    }

    // Aplicar ordenamiento
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
      case "recent":
      default:
        // Mantener orden original (más reciente primero)
        break;
    }

    return filtered;
  }, [
    productsData,
    categoryParam,
    subcategoryParam,
    manufacturerParam,
    searchParam,
    minPriceParam,
    maxPriceParam,
    sortBy,
  ]);

  // Paginación en el cliente
  const ITEMS_PER_PAGE = 12;
  const totalCount = filteredAndSortedProducts.length;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedProducts = filteredAndSortedProducts.slice(
    startIndex,
    endIndex,
  );

  const handleFilterChange = (key: string, value: string | undefined) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    // Si cambiamos categoria, reseteamos subcategoria
    if (key === "category") {
      newParams.delete("subcategory");
    }
    // Reset page to 1 when changing filters
    if (key !== "page") {
      newParams.delete("page");
    }
    setSearchParams(newParams);
  };

  // Helper para obtener el nombre de display de una categoría desde el código
  const getCategoryDisplayNameFromCode = (code: string | null): string => {
    if (!code) return "";
    const result = getCategoryDisplayName(code);
    // Ensure we always return a string, not an object
    if (typeof result === "string") {
      return result;
    }
    if (result && typeof result === "object" && "name" in result) {
      return (result as { name: string }).name || code;
    }
    return code;
  };

  // Helper para obtener el nombre de display de una subcategoría desde el código
  const getSubcategoryDisplayNameFromCode = (code: string | null): string => {
    if (!code) return "";
    const result = getSubcategoryDisplayName(code);
    // Ensure we always return a string, not an object
    if (typeof result === "string") {
      return result;
    }
    if (result && typeof result === "object" && "name" in result) {
      return (result as { name: string }).name || code;
    }
    return code;
  };

  // Helper para obtener el nombre de display de una marca desde su ID
  const getBrandDisplayNameFromId = (id: string | null): string => {
    if (!id) return "";
    const brand = brands?.find((b) => b.id.toString() === id);
    return brand?.name || id;
  };

  const handlePageChange = (page: number) => {
    setIsChangingPage(true);
    handleFilterChange("page", page.toString());
    // Reset loading state after a short delay to allow for smooth transition
    setTimeout(() => setIsChangingPage(false), 500);
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const toggleCategory = (categoryId: number, isOpen: boolean) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (isOpen) {
        newSet.add(categoryId.toString());
      } else {
        newSet.delete(categoryId.toString());
        // Limpiar filtro cuando se cierra la categoría
        const category = apiCategories?.find((cat) => cat.id === categoryId);
        if (category) {
          // Buscar el código de categoría estática correspondiente
          const staticCategory = getAllCategoriesFormatted().find(
            (staticCat) =>
              staticCat.name.toLowerCase() === category.name.toLowerCase() ||
              staticCat.shortName.toLowerCase() === category.name.toLowerCase(),
          );
          const categoryCode = staticCategory?.code || category.name;

          if (
            categoryParam === categoryCode ||
            categoryParam === category.name
          ) {
            handleFilterChange("category", undefined);
          }
        }
      }
      return newSet;
    });
  };

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

          {/* Desktop Sidebar / Mobile Drawer */}
          <aside
            className={`
            fixed inset-0 z-50 lg:sticky lg:top-24 lg:z-0 lg:block lg:self-start
            ${isSidebarOpen ? "block" : "hidden"}
            lg:w-80 transition-all duration-300
          `}
          >
            {/* Mobile Backdrop */}
            <div
              className="absolute inset-0 bg-black/80 backdrop-blur-sm lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />

            {/* Sidebar Content */}
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
                <Collapsible
                  open={isCategoriesOpen}
                  onOpenChange={setIsCategoriesOpen}
                >
                  <div className="flex items-center justify-between">
                    <CollapsibleTrigger asChild>
                      <button className="flex items-center gap-2 text-xs font-bold tracking-widest text-gray-500 uppercase hover:text-white transition-colors">
                        {t("catalog.filters.categories")}
                        <ChevronRight
                          className={`w-4 h-4 transition-transform ${isCategoriesOpen ? "rotate-90" : ""}`}
                        />
                      </button>
                    </CollapsibleTrigger>
                    {categoryParam && (
                      <button
                        onClick={() =>
                          handleFilterChange("category", undefined)
                        }
                        className="text-[10px] font-bold text-red-500 hover:text-red-400 uppercase tracking-tighter"
                      >
                        {t("catalog.filters.clear")}
                      </button>
                    )}
                  </div>
                  <CollapsibleContent className="space-y-1 mt-4">
                    {/* Mostrar estado de carga */}
                    {isCategoriesLoading && (
                      <div className="space-y-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Skeleton key={i} className="h-12 w-full" />
                        ))}
                      </div>
                    )}

                    {/* Mostrar error */}
                    {isCategoriesError && (
                      <div className="text-red-500 text-sm py-2">
                        Error al cargar categorías
                      </div>
                    )}

                    {/* Mostrar categorías desde la API que tienen productos */}
                    {!isCategoriesLoading &&
                      !isCategoriesError &&
                      apiCategories?.map((cat) => {
                        const availableCategory = availableCategories.find(
                          (ac) =>
                            ac.mappedCategory?.id === cat.id ||
                            ac.name === cat.name,
                        );
                        const hasProducts =
                          availableCategory && availableCategory.count > 0;

                        if (!hasProducts) return null;

                        // Intentar mapear la categoría de la API a una categoría estática por nombre
                        const staticCategory = getAllCategoriesFormatted().find(
                          (staticCat) =>
                            staticCat.name.toLowerCase() ===
                              cat.name.toLowerCase() ||
                            staticCat.shortName.toLowerCase() ===
                              cat.name.toLowerCase(),
                        );

                        // Usar el código de la categoría estática si existe, sino usar el nombre
                        const categoryCode =
                          staticCategory?.code || cat.code || cat.name;
                        const displayName =
                          staticCategory?.displayName || cat.name;
                        const isActive =
                          categoryParam === categoryCode ||
                          categoryParam === cat.name;

                        return (
                          <Collapsible
                            key={cat.id}
                            open={
                              expandedCategories.has(cat.id.toString()) ||
                              isActive
                            }
                            onOpenChange={(isOpen) =>
                              toggleCategory(cat.id, isOpen)
                            }
                          >
                            <CollapsibleTrigger asChild>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Usar el código si existe, sino el nombre
                                  handleFilterChange("category", categoryCode);
                                }}
                                className={`
                                w-full flex items-center justify-between px-4 py-3 rounded-sm transition-all text-sm
                                ${
                                  isActive
                                    ? "bg-red-600 text-white font-bold"
                                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                                }
                              `}
                              >
                                <span className="flex items-center gap-2">
                                  {displayName}
                                  <span className="text-xs text-gray-500">
                                    ({availableCategory?.count || 0})
                                  </span>
                                </span>
                                <ChevronRight
                                  className={`w-4 h-4 transition-transform ${
                                    expandedCategories.has(cat.id.toString()) ||
                                    isActive
                                      ? "rotate-90"
                                      : ""
                                  }`}
                                />
                              </button>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="pl-6 space-y-1 mt-1">
                              {cat.children?.map((sub) => {
                                // Contar productos para esta subcategoría específica
                                const subCategoryCount =
                                  availableCategories.find(
                                    (ac) =>
                                      ac.name === sub.name ||
                                      ac.mappedCategory?.id === sub.id,
                                  );
                                const hasSubProducts =
                                  subCategoryCount &&
                                  subCategoryCount.count > 0;

                                if (!hasSubProducts) return null;

                                // Intentar mapear la subcategoría
                                const staticSubcategory =
                                  staticCategory?.subcategories?.find(
                                    (staticSub) =>
                                      staticSub.name.toLowerCase() ===
                                        sub.name.toLowerCase() ||
                                      staticSub.shortName.toLowerCase() ===
                                        sub.name.toLowerCase(),
                                  );

                                const subcategoryCode =
                                  staticSubcategory?.code || sub.name;
                                const subDisplayName =
                                  staticSubcategory?.displayName || sub.name;
                                const isSubActive =
                                  subcategoryParam === subcategoryCode ||
                                  subcategoryParam === sub.name;

                                return (
                                  <button
                                    key={sub.id}
                                    onClick={() => {
                                      // Al hacer clic en subcategoría, también establecemos la categoría padre
                                      handleFilterChange(
                                        "category",
                                        categoryCode,
                                      );
                                      handleFilterChange(
                                        "subcategory",
                                        subcategoryCode,
                                      );
                                    }}
                                    className={`
                                    text-left px-4 py-2 text-xs rounded-sm transition-all w-full flex items-center justify-between
                                    ${
                                      isSubActive
                                        ? "text-red-500 font-bold bg-red-500/5"
                                        : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                                    }
                                  `}
                                  >
                                    <span>{subDisplayName}</span>
                                    <span className="text-xs text-gray-600">
                                      ({subCategoryCount?.count || 0})
                                    </span>
                                  </button>
                                );
                              })}
                            </CollapsibleContent>
                          </Collapsible>
                        );
                      })}

                    {/* Mostrar categorías no mapeadas que existen en productos */}
                    {availableCategories
                      .filter((ac) => !ac.mappedCategory)
                      .map((ac) => {
                        // Intentar mapear por nombre usando solo getAllCategoriesFormatted
                        const staticCategory = getAllCategoriesFormatted().find(
                          (staticCat) =>
                            staticCat.name.toLowerCase() ===
                              ac.name.toLowerCase() ||
                            staticCat.shortName.toLowerCase() ===
                              ac.name.toLowerCase(),
                        );

                        const categoryCode = staticCategory?.code || ac.name;
                        const displayName =
                          staticCategory?.displayName || ac.name;
                        const isActive =
                          categoryParam === categoryCode ||
                          categoryParam === ac.name;

                        return (
                          <button
                            key={ac.name}
                            onClick={() =>
                              handleFilterChange("category", categoryCode)
                            }
                            className={`
                              w-full flex items-center justify-between px-4 py-3 rounded-sm transition-all text-sm
                              ${
                                isActive
                                  ? "bg-red-600 text-white font-bold"
                                  : "text-gray-400 hover:bg-white/5 hover:text-white"
                              }
                            `}
                          >
                            <span className="flex items-center gap-2">
                              {displayName}
                              <span className="text-xs text-gray-500">
                                ({ac.count})
                              </span>
                            </span>
                          </button>
                        );
                      })}
                  </CollapsibleContent>
                </Collapsible>

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

              {/* Breadcrumbs / Active Filters */}
              {(categoryParam ||
                subcategoryParam ||
                manufacturerParam ||
                minPriceParam ||
                maxPriceParam ||
                searchParam) && (
                <div className="flex flex-wrap gap-2 mt-8">
                  {categoryParam && (
                    <ActiveFilter
                      label={getCategoryDisplayNameFromCode(categoryParam)}
                      onClear={() => handleFilterChange("category", undefined)}
                    />
                  )}
                  {subcategoryParam && (
                    <ActiveFilter
                      label={getSubcategoryDisplayNameFromCode(
                        subcategoryParam,
                      )}
                      onClear={() =>
                        handleFilterChange("subcategory", undefined)
                      }
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
                    <SelectItem
                      value="recent"
                      className="cursor-pointer hover:bg-red-600 hover:text-white focus:bg-red-600 focus:text-white"
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-red-500 group-hover:text-white" />
                        <span>
                          {t("catalog.sortOptions.recent", "Más Recientes")}
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem
                      value="price-asc"
                      className="cursor-pointer hover:bg-red-600 hover:text-white focus:bg-red-600 focus:text-white"
                    >
                      <div className="flex items-center gap-2">
                        <ArrowDown01 className="w-4 h-4 text-red-500 group-hover:text-white" />
                        <span>
                          {t(
                            "catalog.sortOptions.priceAsc",
                            "Precio: Menor a Mayor",
                          )}
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem
                      value="price-desc"
                      className="cursor-pointer hover:bg-red-600 hover:text-white focus:bg-red-600 focus:text-white"
                    >
                      <div className="flex items-center gap-2">
                        <ArrowUp01 className="w-4 h-4 text-red-500 group-hover:text-white" />
                        <span>
                          {t(
                            "catalog.sortOptions.priceDesc",
                            "Precio: Mayor a Menor",
                          )}
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem
                      value="name-asc"
                      className="cursor-pointer hover:bg-red-600 hover:text-white focus:bg-red-600 focus:text-white"
                    >
                      <div className="flex items-center gap-2">
                        <ArrowDownAZ className="w-4 h-4 text-red-500 group-hover:text-white" />
                        <span>
                          {t("catalog.sortOptions.nameAsc", "Nombre: A - Z")}
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem
                      value="name-desc"
                      className="cursor-pointer hover:bg-red-600 hover:text-white focus:bg-red-600 focus:text-white"
                    >
                      <div className="flex items-center gap-2">
                        <ArrowUpAZ className="w-4 h-4 text-red-500 group-hover:text-white" />
                        <span>
                          {t("catalog.sortOptions.nameDesc", "Nombre: Z - A")}
                        </span>
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
                  <p className="text-red-500 font-bold mb-4">
                    {t("catalog.error")}
                  </p>
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
                  {/* Image Gallery */}
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
                          <img
                            src={img.image}
                            alt=""
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <span className="px-2 py-0.5 bg-red-600 text-[10px] font-black text-white uppercase tracking-tighter rounded-xs">
                          {getCategoryName(selectedProduct.category) ||
                            "General"}
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
                        <span
                          className={`text-sm font-bold uppercase tracking-widest ${
                            (selectedProduct.inventory?.quantity || 0) > 0
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        >
                          {(selectedProduct.inventory?.quantity || 0) > 0
                            ? `✓ ${selectedProduct.inventory?.quantity} ${t("catalog.details.stock")}`
                            : `✕ ${t("catalog.details.noStock")}`}
                        </span>
                      </div>

                      <div className="space-y-6 mb-12">
                        <div className="prose prose-invert max-w-none">
                          <p className="text-gray-400 leading-relaxed text-lg">
                            {selectedProduct.description ||
                              t("catalog.details.descriptionDefault")}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pb-8 border-b border-white/5">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                            {t("catalog.details.id")}
                          </span>
                          <p className="text-sm font-mono text-white">
                            #{selectedProduct.id.toString().padStart(6, "0")}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                            {t("catalog.details.category")}
                          </span>
                          <p className="text-sm text-white">
                            {getCategoryName(selectedProduct.category) || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-8 flex gap-4">
                      <div className="flex-1">
                        <AddToCart product={selectedProduct} variant="detail" />
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
    </div>
  );
}

function ActiveFilter({
  label,
  onClear,
}: {
  label: string;
  onClear: () => void;
}) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-red-600/10 border border-red-600/30 rounded-full text-xs font-bold text-red-500">
      <span>{label}</span>
      <X
        className="w-3 h-3 cursor-pointer hover:text-red-400"
        onClick={onClear}
      />
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
  const { t } = useTranslation();
  const { name, category, price, images, inventory } = product;
  const imageUrl =
    images?.find((img) => img.is_main)?.image || images?.[0]?.image;
  const numericPrice = parseFloat(price || "0");

  return (
    <div
      onClick={onSelect}
      className="cursor-pointer rounded-sm group relative bg-zinc-900/40 border border-white/5 hover:border-red-600/50 transition-all duration-500 overflow-hidden"
      style={{ contain: "layout style paint" }}
    >
      {/* Image Container */}
      <div
        className="aspect-square bg-zinc-900 flex items-center justify-center transition-transform duration-700 overflow-hidden relative"
        style={{ contain: "layout" }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 will-change-transform"
            style={{
              aspectRatio: "1/1",
              backgroundColor: "#18181b",
              backgroundImage: `url(data:image/svg+xml;base64,${btoa(
                '<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#18181b"/></svg>',
              )})`,
            }}
          />
        ) : (
          <Package
            width={65}
            height={65}
            className="opacity-10 group-hover:opacity-30 transition-opacity will-change-opacity"
          />
        )}

        {/* Overlay info */}
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6 will-change-opacity">
          <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] will-change-transform">
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

      <div className="p-6 contain-layout">
        <div className="flex justify-between items-start mb-3">
          <span className="text-[10px] font-bold text-red-600 tracking-widest uppercase bg-red-600/10 px-2 py-0.5 rounded-xs will-change-transform">
            {getCategoryName(category) || "General"}
          </span>
          <span className="text-[10px] text-gray-600 font-mono">
            #{product.id.toString().padStart(3, "0")}
          </span>
        </div>

        <h3 className="text-lg font-bold text-white mb-6 group-hover:text-red-500 transition-colors line-clamp-2 min-h-14 leading-snug will-change-colors">
          {name}
        </h3>

        <div className="flex justify-between items-center pt-4 border-t border-white/5">
          <span className="text-xl font-light text-white will-change-transform">
            ${numericPrice.toLocaleString()}
          </span>
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
  // Usar totalPages de la API si está disponible, sino calcularlo
  const calculatedTotalPages = totalPages || Math.ceil(totalCount / 12);

  if (calculatedTotalPages <= 1) return null;

  const getVisiblePages = () => {
    const delta = 2;
    const range: number[] = [];
    const rangeWithDots: (number | string)[] = [];
    let l: number | undefined;

    for (let i = 1; i <= calculatedTotalPages; i++) {
      if (
        i === 1 ||
        i === calculatedTotalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        range.push(i);
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push("...");
        }
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
            className={
              !hasPrevious && currentPage === 1
                ? "pointer-events-none opacity-50"
                : "cursor-pointer"
            }
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
            onClick={() =>
              currentPage < calculatedTotalPages &&
              onPageChange(currentPage + 1)
            }
            className={
              !hasNext && currentPage === calculatedTotalPages
                ? "pointer-events-none opacity-50"
                : "cursor-pointer"
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
