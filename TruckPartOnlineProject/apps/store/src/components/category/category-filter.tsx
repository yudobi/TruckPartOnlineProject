/**
 * CategoryFilter Component
 *
 * Filtro jerárquico de categorías para el catálogo de productos.
 * Soporta 4 niveles: category → subcategory → system → piece
 *
 * USO:
 *   import CategoryFilter, { type CategoryFilterValue, type CategoryFilterNode } from "@/components/category/category-filter";
 *
 *   <CategoryFilter tree={apiCategories} onChange={handleCategoryFilterChange} />
 *
 * El `onChange` emite un objeto con:
 *   - category_ids    → IDs del nivel "category"
 *   - subcategory_ids → IDs del nivel "subcategory"
 *   - system_ids      → IDs del nivel "system"
 *   - piece_ids       → IDs del nivel "piece"
 *
 * La lógica de filtrado en ProductsPage ya agrupa todos estos IDs en un Set
 * y verifica si el category.id del producto es descendiente de alguno de ellos.
 */

import { useState, useCallback } from "react";
import { ChevronRight, Tag } from "lucide-react";
import { useTranslation } from "react-i18next";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CategoryFilterNode {
  id: number;
  name: string;
  level: "category" | "subcategory" | "system" | "piece";
  parent: number | null;
  qb_id: string | null;
  children?: CategoryFilterNode[];
}

export interface CategoryFilterValue {
  category_ids: number[];
  subcategory_ids: number[];
  system_ids: number[];
  piece_ids: number[];
}

interface CategoryFilterProps {
  tree: CategoryFilterNode[];
  onChange: (value: CategoryFilterValue) => void;
  /** Valor controlado opcional; si no se pasa, el componente maneja su propio estado */
  value?: CategoryFilterValue;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const LEVEL_KEY: Record<CategoryFilterNode["level"], keyof CategoryFilterValue> = {
  category: "category_ids",
  subcategory: "subcategory_ids",
  system: "system_ids",
  piece: "piece_ids",
};

/** Recopila todos los IDs del subárbol de un nodo (incluyéndolo) */
function collectAllIds(node: CategoryFilterNode): number[] {
  const ids: number[] = [node.id];
  node.children?.forEach((c) => ids.push(...collectAllIds(c)));
  return ids;
}

/** Dado el árbol, construye un mapa id → node para búsquedas rápidas */
function buildNodeMap(
  nodes: CategoryFilterNode[],
  map: Map<number, CategoryFilterNode> = new Map(),
): Map<number, CategoryFilterNode> {
  for (const node of nodes) {
    map.set(node.id, node);
    if (node.children?.length) buildNodeMap(node.children, map);
  }
  return map;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CategoryFilter({ tree, onChange, value: controlledValue }: CategoryFilterProps) {
  const { t } = useTranslation();

  // Estado interno de selección: Set de IDs seleccionados
  const [selected, setSelected] = useState<Set<number>>(new Set());

  // Estado de acordeones abiertos
  const [openNodes, setOpenNodes] = useState<Set<number>>(new Set());

  // Usar valor controlado si se proporciona
  const effectiveSelected = controlledValue
    ? new Set([
        ...controlledValue.category_ids,
        ...controlledValue.subcategory_ids,
        ...controlledValue.system_ids,
        ...controlledValue.piece_ids,
      ])
    : selected;

  const nodeMap = buildNodeMap(tree);

  /** Convierte el Set de IDs seleccionados en el objeto CategoryFilterValue */
  const toFilterValue = useCallback(
    (ids: Set<number>): CategoryFilterValue => {
      const result: CategoryFilterValue = {
        category_ids: [],
        subcategory_ids: [],
        system_ids: [],
        piece_ids: [],
      };
      for (const id of ids) {
        const node = nodeMap.get(id);
        if (node) {
          result[LEVEL_KEY[node.level]].push(id);
        }
      }
      return result;
    },
    [nodeMap],
  );

  const toggleNode = useCallback(
    (node: CategoryFilterNode) => {
      const newSelected = new Set(effectiveSelected);
      const allIds = collectAllIds(node);

      const isSelected = newSelected.has(node.id);

      if (isSelected) {
        // Deseleccionar este nodo y todos sus descendientes
        allIds.forEach((id) => newSelected.delete(id));
      } else {
        // Seleccionar este nodo y todos sus descendientes
        allIds.forEach((id) => newSelected.add(id));

        // Auto-abrir el acordeón si tiene hijos
        if (node.children?.length) {
          setOpenNodes((prev) => new Set([...prev, node.id]));
        }
      }

      if (!controlledValue) setSelected(newSelected);
      onChange(toFilterValue(newSelected));
    },
    [effectiveSelected, controlledValue, onChange, toFilterValue],
  );

  const toggleAccordion = (id: number) => {
    setOpenNodes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearAll = () => {
    if (!controlledValue) setSelected(new Set());
    onChange({ category_ids: [], subcategory_ids: [], system_ids: [], piece_ids: [] });
  };

  const totalSelected = effectiveSelected.size;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold tracking-widest text-gray-500 uppercase">
          {t("catalog.filters.categories", "Categorías")}
        </h3>
        {totalSelected > 0 && (
          <button
            onClick={clearAll}
            className="text-[10px] font-bold text-red-500 hover:text-red-400 uppercase tracking-tighter transition-colors"
          >
            {t("catalog.filters.clear", "Limpiar")}
            {totalSelected > 0 && ` (${totalSelected})`}
          </button>
        )}
      </div>

      {/* Tree */}
      <div className="space-y-1">
        {tree.map((node) => (
          <CategoryNode
            key={node.id}
            node={node}
            depth={0}
            selected={effectiveSelected}
            openNodes={openNodes}
            onToggleSelect={toggleNode}
            onToggleAccordion={toggleAccordion}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Recursive Node ───────────────────────────────────────────────────────────

interface CategoryNodeProps {
  node: CategoryFilterNode;
  depth: number;
  selected: Set<number>;
  openNodes: Set<number>;
  onToggleSelect: (node: CategoryFilterNode) => void;
  onToggleAccordion: (id: number) => void;
}

function CategoryNode({
  node,
  depth,
  selected,
  openNodes,
  onToggleSelect,
  onToggleAccordion,
}: CategoryNodeProps) {
  const hasChildren = (node.children?.length ?? 0) > 0;
  const isOpen = openNodes.has(node.id);
  const isSelected = selected.has(node.id);

  // Verificar si algún descendiente está seleccionado (para mostrar estado "parcial")
  const hasSelectedDescendant = hasChildren
    ? node.children!.some((child) => hasAnySelected(child, selected))
    : false;

  const isPartial = !isSelected && hasSelectedDescendant;

  // Estilos según nivel de profundidad
  const depthStyles: Record<number, string> = {
    0: "text-[11px] font-black tracking-widest uppercase text-gray-400",
    1: "text-[11px] font-bold tracking-wider uppercase text-gray-400",
    2: "text-[11px] font-semibold text-gray-500",
    3: "text-[11px] font-medium text-gray-500",
  };

  const paddingLeft = depth * 12;

  return (
    <div>
      <div
        className={`
          flex items-center gap-2 py-2 px-2 rounded-xs cursor-pointer group transition-all duration-200
          ${isSelected ? "bg-red-600/15 text-white" : "hover:bg-white/5 text-gray-400 hover:text-white"}
          ${isPartial ? "bg-white/3" : ""}
        `}
        style={{ paddingLeft: `${8 + paddingLeft}px` }}
      >
        {/* Checkbox visual */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect(node);
          }}
          className={`
            flex-shrink-0 w-4 h-4 rounded-xs border transition-all duration-200 flex items-center justify-center
            ${
              isSelected
                ? "bg-red-600 border-red-600"
                : isPartial
                  ? "border-red-600/50 bg-red-600/10"
                  : "border-white/20 group-hover:border-white/40"
            }
          `}
          aria-label={`Seleccionar ${node.name}`}
        >
          {isSelected && (
            <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
              <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
          {isPartial && (
            <div className="w-2 h-0.5 bg-red-500 rounded-full" />
          )}
        </button>

        {/* Label */}
        <span
          onClick={() => {
            if (hasChildren) onToggleAccordion(node.id);
            else onToggleSelect(node);
          }}
          className={`flex-1 select-none leading-tight transition-colors ${depthStyles[depth] || depthStyles[3]} ${isSelected ? "!text-white" : ""}`}
        >
          {node.name}
        </span>

        {/* Chevron si tiene hijos */}
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleAccordion(node.id);
            }}
            className="shrink-0 text-gray-600 hover:text-white transition-colors"
          >
            <ChevronRight
              className={`w-3.5 h-3.5 transition-transform duration-300 ${isOpen ? "rotate-90" : ""}`}
            />
          </button>
        )}

        {/* Dot indicator si es hoja (piece) */}
        {!hasChildren && (
          <Tag className="w-2.5 h-2.5 text-gray-700 shrink-0" />
        )}
      </div>

      {/* Children - acordeón */}
      {hasChildren && isOpen && (
        <div
          className="overflow-hidden"
          style={{
            borderLeft: depth < 2 ? "1px solid rgba(255,255,255,0.06)" : "none",
            marginLeft: `${16 + paddingLeft}px`,
          }}
        >
          {node.children!.map((child) => (
            <CategoryNode
              key={child.id}
              node={child}
              depth={depth + 1}
              selected={selected}
              openNodes={openNodes}
              onToggleSelect={onToggleSelect}
              onToggleAccordion={onToggleAccordion}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Utils ────────────────────────────────────────────────────────────────────

function hasAnySelected(node: CategoryFilterNode, selected: Set<number>): boolean {
  if (selected.has(node.id)) return true;
  return node.children?.some((c) => hasAnySelected(c, selected)) ?? false;
}