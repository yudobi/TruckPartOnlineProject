import { Search, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import CategoryFilter, {
  type CategoryFilterValue,
  type CategoryFilterNode,
} from "@/components/category/category-filter";
import { type Brand } from "@app-types/product";

// ─── Props ────────────────────────────────────────────────────────────────────

interface ProductFiltersProps {
  // Search
  searchTerm: string;
  onSearchChange: (value: string) => void;

  // Categories
  apiCategories: CategoryFilterNode[] | undefined;
  isCategoriesLoading: boolean;
  isCategoriesError: boolean;
  onCategoryFilterChange: (value: CategoryFilterValue) => void;

  // Brands / Manufacturers
  brands: Brand[] | undefined;
  isBrandsLoading: boolean;
  isBrandsError: boolean;
  selectedBrand: string | null;
  onBrandChange: (brandId: string) => void;
  onBrandClear: () => void;

  // Price range
  minPrice: string;
  maxPrice: string;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;

  // Clear all
  onClearAll: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ProductFilters({
  searchTerm,
  onSearchChange,
  apiCategories,
  isCategoriesLoading,
  isCategoriesError,
  onCategoryFilterChange,
  brands,
  isBrandsLoading,
  isBrandsError,
  selectedBrand,
  onBrandChange,
  onBrandClear,
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
  onClearAll,
}: ProductFiltersProps) {
  const { t } = useTranslation();

  return (
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
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Buscar productos"
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
          <div className="text-red-500 text-sm">Error al cargar categorías</div>
        </div>
      ) : apiCategories && apiCategories.length > 0 ? (
        <CategoryFilter tree={apiCategories} onChange={onCategoryFilterChange} />
      ) : (
        <div className="space-y-4">
          <h3 className="text-xs font-bold tracking-widest text-gray-500 uppercase">
            {t("catalog.filters.categories")}
          </h3>
          <p className="text-gray-500 text-sm">No hay categorías disponibles</p>
        </div>
      )}

      {/* Manufacturers */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold tracking-widest text-gray-500 uppercase">
            {t("catalog.filters.manufacturers")}
          </h3>
          {selectedBrand && (
            <button
              onClick={onBrandClear}
              className="text-[10px] font-bold text-red-500 hover:text-red-400 uppercase tracking-tighter"
            >
              {t("catalog.filters.clear")}
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {isBrandsLoading && (
            <div className="text-gray-500 text-sm">Cargando fabricantes...</div>
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
                onClick={() => onBrandChange(brand.id.toString())}
                aria-label={`Filtrar por fabricante: ${brand.name}`}
                aria-pressed={selectedBrand === brand.id.toString()}
                className={`
                  px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase border rounded-xs transition-all
                  ${
                    selectedBrand === brand.id.toString()
                      ? "bg-red-600 border-red-600 text-white"
                      : "bg-white/5 border-white/10 text-gray-400 hover:border-white/30 hover:text-white"
                  }
                `}
              >
                {brand.name}
              </button>
            ))}
          {!isBrandsLoading && !isBrandsError && brands?.length === 0 && (
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
            value={minPrice}
            onChange={(e) => onMinPriceChange(e.target.value)}
            aria-label="Precio mínimo"
          />
          <Input
            placeholder="Max"
            type="number"
            className="bg-white/5 border-white/10 text-white h-10 text-sm"
            value={maxPrice}
            onChange={(e) => onMaxPriceChange(e.target.value)}
            aria-label="Precio máximo"
          />
        </div>
      </div>

      <Button
        variant="outline"
        className="w-full border-red-600/20 text-gray-400 hover:bg-red-600 hover:text-white transition-all text-xs font-bold tracking-widest uppercase"
        onClick={onClearAll}
      >
        <X className="w-4 h-4 mr-2" />
        {t("catalog.filters.clear")}
      </Button>
    </div>
  );
}

export default ProductFilters;
