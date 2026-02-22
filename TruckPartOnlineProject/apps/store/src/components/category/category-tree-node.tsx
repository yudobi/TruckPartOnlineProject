"use client"

import { useState } from "react"
import { ChevronRight } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import type { Category } from "@/lib/categories"

interface CategoryTreeNodeProps {
  category: Category
  level?: number
  selectedCategories: Set<string>
  onToggleCategory: (id: string) => void
  variant?: "filter" | "nav"
}

export function CategoryTreeNode({
  category,
  level = 0,
  selectedCategories,
  onToggleCategory,
  variant = "filter",
}: CategoryTreeNodeProps) {
  const [isOpen, setIsOpen] = useState(level === 0)
  const hasChildren = category.children && category.children.length > 0
  const isSelected = selectedCategories.has(category.id)

  if (!hasChildren) {
    return (
      <div
        className={cn(
          "flex items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors",
          variant === "filter"
            ? "hover:bg-accent"
            : "hover:bg-accent cursor-pointer",
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
      >
        {variant === "filter" ? (
          <>
            <Checkbox
              id={category.id}
              checked={isSelected}
              onCheckedChange={() => onToggleCategory(category.id)}
              className="size-3.5"
            />
            <label
              htmlFor={category.id}
              className="cursor-pointer text-sm text-foreground/80 leading-none select-none"
            >
              {category.name}
            </label>
          </>
        ) : (
          <button
            onClick={() => onToggleCategory(category.id)}
            className={cn(
              "w-full text-left text-sm leading-none select-none",
              isSelected
                ? "font-medium text-foreground"
                : "text-foreground/70",
            )}
          >
            {category.name}
          </button>
        )}
      </div>
    )
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div
        className={cn(
          "flex items-center gap-1 rounded-md transition-colors",
          variant === "filter" ? "hover:bg-accent" : "hover:bg-accent",
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
      >
        <CollapsibleTrigger asChild>
          <button
            className="flex flex-1 items-center gap-2 py-1.5 px-1"
            aria-label={`${isOpen ? "Colapsar" : "Expandir"} ${category.name}`}
          >
            <ChevronRight
              className={cn(
                "size-3.5 shrink-0 text-muted-foreground transition-transform duration-200",
                isOpen && "rotate-90",
              )}
            />
            <span
              className={cn(
                "text-sm font-medium leading-none select-none",
                level === 0 ? "text-foreground" : "text-foreground/90",
              )}
            >
              {category.name}
            </span>
          </button>
        </CollapsibleTrigger>

        {variant === "filter" && (
          <Checkbox
            id={category.id}
            checked={isSelected}
            onCheckedChange={() => onToggleCategory(category.id)}
            className="mr-2 size-3.5"
          />
        )}
      </div>

      <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-[collapsible-up_150ms_ease-out] data-[state=open]:animate-[collapsible-down_150ms_ease-out]">
        <div className="flex flex-col">
          {category.children?.map((child) => (
            <CategoryTreeNode
              key={child.id}
              category={child}
              level={level + 1}
              selectedCategories={selectedCategories}
              onToggleCategory={onToggleCategory}
              variant={variant}
            />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
