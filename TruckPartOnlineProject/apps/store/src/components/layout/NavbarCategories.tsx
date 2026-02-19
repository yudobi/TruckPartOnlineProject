"use client";

import { useNavigate } from "react-router";
import { ChevronDown, Wrench } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { useCategoriesWithSubcategories } from "@hooks/useCategories";
import type { CategoryTree } from "@/types/category";
import { useTranslation } from "react-i18next";

/**
 * Componente de categorías integrado con el diseño del Navbar actual
 * Usa el mismo estilo negro/rojo del navbar existente
 */
export function NavbarCategories() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: categories, isLoading } = useCategoriesWithSubcategories();

  const handleCategoryClick = (category: CategoryTree) => {
    const params = new URLSearchParams();
    // Use category name for filtering as ProductsPage filters by name match
    params.append("category", category.name);
    navigate(`/products?${params.toString()}`);
  };

  if (isLoading) {
    return (
      <div className="text-sm font-bold tracking-widest text-white/50">
        {t("nav.search").toUpperCase()}
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="text-sm font-bold tracking-widest hover:text-red-600 transition-colors duration-300 text-white focus:outline-none flex items-center gap-1 cursor-pointer">
        {t("nav.search").toUpperCase()}
        <ChevronDown className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-black/95 border-white/10 text-white backdrop-blur-xl p-2 animate-in fade-in-0 zoom-in-95">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs font-bold tracking-widest text-gray-500 uppercase px-2 mb-2">
            {t("nav.searchCategory")}
          </DropdownMenuLabel>
          {categories.map((category) => {
            const categoryCode = category.code || String(category.id);
            const hasChildren =
              category.children && category.children.length > 0;

            if (!hasChildren) {
              return (
                <DropdownMenuItem
                  key={categoryCode}
                  className="group flex items-center gap-2 py-2.5 cursor-pointer focus:bg-red-600 focus:text-white transition-colors"
                  onClick={() => handleCategoryClick(category)}
                >
                  <Wrench className="w-4 h-4 text-red-500 group-focus:text-white transition-colors" />
                  <span className="text-sm">
                    {category.short_name || category.name}
                  </span>
                </DropdownMenuItem>
              );
            }

            return (
              <DropdownMenuSub key={categoryCode}>
                <DropdownMenuSubTrigger
                  className="group flex items-center gap-2 py-2.5 cursor-pointer focus:bg-red-600 focus:text-white data-[state=open]:bg-red-600 data-[state=open]:text-white transition-colors"
                  onClick={() => handleCategoryClick(category)}
                >
                  <Wrench className="w-4 h-4 text-red-500 group-focus:text-white group-data-[state=open]:text-white transition-colors" />
                  <span className="text-sm">
                    {category.short_name || category.name}
                  </span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="bg-black/95 border-white/10 text-white backdrop-blur-xl p-2">
                    {category.children?.map((subcategory: CategoryTree) => {
                      const subCode =
                        subcategory.code || String(subcategory.id);
                      return (
                        <DropdownMenuItem
                          key={subCode}
                          className="cursor-pointer py-2.5 text-sm focus:bg-red-600 focus:text-white transition-colors"
                          onClick={() => handleCategoryClick(subcategory)}
                        >
                          {subcategory.short_name || subcategory.name}
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            );
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
