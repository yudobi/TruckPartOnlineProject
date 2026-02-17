"use client";

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { ChevronDown, ChevronRight, Menu, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import type { CategoryTree } from "@/types/category";

interface CategoryNavbarProps {
  categories: CategoryTree[];
}

/* ── Submenu item recursivo (para niveles 2+) ── */
function SubmenuItem({
  category,
  level = 0,
  onSelect,
}: {
  category: CategoryTree;
  level?: number;
  onSelect?: (code: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const hasChildren = category.children && category.children.length > 0;
  const ref = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    const categoryCode = category.code || String(category.id);
    params.append("category", categoryCode);
    navigate(`/products?${params.toString()}`);
    onSelect?.(categoryCode);
  };

  if (!hasChildren) {
    return (
      <button
        onClick={handleClick}
        className="flex items-center rounded-md px-3 py-2 text-sm text-foreground/80 transition-colors hover:bg-accent hover:text-accent-foreground w-full text-left"
      >
        {category.short_name || category.name}
      </button>
    );
  }

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm text-foreground/80 transition-colors hover:bg-accent hover:text-accent-foreground"
        onClick={() => setOpen((p) => !p)}
      >
        <span>{category.short_name || category.name}</span>
        <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute left-full top-0 z-50 ml-1 w-56 rounded-lg border bg-popover p-1 shadow-lg animate-in fade-in-0 slide-in-from-left-1 duration-150">
          {category.children?.map((child: CategoryTree) => (
            <SubmenuItem
              key={child.code || child.id}
              category={child}
              level={level + 1}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Item principal (nivel 0) con submenu flyout ── */
function TopLevelItem({
  category,
  onSelect,
}: {
  category: CategoryTree;
  onSelect?: (code: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const hasChildren = category.children && category.children.length > 0;

  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    const categoryCode = category.code || String(category.id);
    params.append("category", categoryCode);
    navigate(`/products?${params.toString()}`);
    onSelect?.(categoryCode);
  };

  if (!hasChildren) {
    return (
      <button
        onClick={handleClick}
        className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground w-full text-left"
      >
        {category.short_name || category.name}
      </button>
    );
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        onClick={() => setOpen((p) => !p)}
      >
        <span>{category.short_name || category.name}</span>
        <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute left-full top-0 z-50 ml-1 w-56 rounded-lg border bg-popover p-1 shadow-lg animate-in fade-in-0 slide-in-from-left-1 duration-150">
          {category.children?.map((child: CategoryTree) => (
            <SubmenuItem
              key={child.code || child.id}
              category={child}
              onSelect={(code) => {
                setOpen(false);
                onSelect?.(code);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Mobile: arbol collapsible para Sheet ── */
function MobileTreeItem({
  category,
  level = 0,
  onSelect,
}: {
  category: CategoryTree;
  level?: number;
  onSelect?: (code: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = category.children && category.children.length > 0;

  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    const categoryCode = category.code || String(category.id);
    params.append("category", categoryCode);
    navigate(`/products?${params.toString()}`);
    onSelect?.(categoryCode);
  };

  if (!hasChildren) {
    return (
      <button
        onClick={handleClick}
        className={cn(
          "flex items-center rounded-md px-3 py-2.5 text-sm transition-colors hover:bg-accent w-full text-left",
          level === 0
            ? "font-medium text-foreground"
            : "text-muted-foreground hover:text-foreground",
        )}
        style={{ paddingLeft: `${level * 16 + 12}px` }}
      >
        {category.short_name || category.name}
      </button>
    );
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <button
          className={cn(
            "flex w-full items-center justify-between rounded-md px-3 py-2.5 text-sm transition-colors hover:bg-accent",
            level === 0
              ? "font-medium text-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
          style={{ paddingLeft: `${level * 16 + 12}px` }}
        >
          <span>{category.short_name || category.name}</span>
          <ChevronRight
            className={cn(
              "size-3.5 shrink-0 text-muted-foreground transition-transform duration-200",
              isOpen && "rotate-90",
            )}
          />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        {category.children?.map((child) => (
          <MobileTreeItem
            key={child.code || child.id}
            category={child}
            level={level + 1}
            onSelect={onSelect}
          />
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}

/* ── Componente principal del Navbar ── */
export function CategoryNavbar({ categories }: CategoryNavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    if (menuOpen) {
      document.addEventListener("keydown", handleEscape);
    }
    return () => document.removeEventListener("keydown", handleEscape);
  }, [menuOpen]);

  return (
    <nav className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4">
        {/* Logo */}
        <a href="/" className="flex shrink-0 items-center gap-2">
          <ShoppingBag className="size-5 text-foreground" />
          <span className="text-base font-semibold tracking-tight text-foreground">
            MiTienda
          </span>
        </a>

        {/* ── Desktop: boton "Categorias" con dropdown de submenus ── */}
        <div ref={dropdownRef} className="relative hidden md:block">
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
              menuOpen ? "bg-accent text-accent-foreground" : "text-foreground",
            )}
            aria-expanded={menuOpen}
            aria-haspopup="true"
          >
            Categorias
            <ChevronDown
              className={cn(
                "size-4 text-muted-foreground transition-transform duration-200",
                menuOpen && "rotate-180",
              )}
            />
          </button>

          {menuOpen && (
            <div className="absolute left-0 top-[calc(100%+4px)] z-50 w-60 rounded-lg border bg-popover p-1 shadow-lg animate-in fade-in-0 slide-in-from-top-1 duration-150">
              {categories.map((cat) => (
                <TopLevelItem
                  key={cat.code || cat.id}
                  category={cat}
                  onSelect={() => setMenuOpen(false)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="hidden flex-1 md:block" />

        {/* ── Mobile: Sheet lateral con collapsibles ── */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="size-9 md:hidden">
              <Menu className="size-5" />
              <span className="sr-only">Menu de categorias</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] p-0">
            <SheetHeader className="px-4 pt-4 pb-3">
              <SheetTitle className="text-base font-semibold">
                Categorias
              </SheetTitle>
            </SheetHeader>
            <Separator />
            <ScrollArea className="h-[calc(100vh-80px)]">
              <div className="flex flex-col gap-0.5 p-2">
                {categories.map((cat) => (
                  <MobileTreeItem
                    key={cat.code || cat.id}
                    category={cat}
                    onSelect={() => setMobileOpen(false)}
                  />
                ))}
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
