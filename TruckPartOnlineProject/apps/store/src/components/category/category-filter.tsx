import { ChevronDown, ChevronUp, Search, X } from "lucide-react";
import { useState, useMemo, useCallback } from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Checkbox } from "@/components/ui/checkbox";

// ── Demo data ─────────────────────────────────────────────────────────────────
const DEMO_TREE = [
  {
    id: 1, name: "Aceite de motor", level: 0, parent: null, qb_id: "ENG",
    children: [
      { id: 11, name: "Sintético", level: 1, parent: 1, qb_id: null },
      { id: 12, name: "Mineral", level: 1, parent: 1, qb_id: null },
      { id: 13, name: "Semi-sintético", level: 1, parent: 1, qb_id: null },
    ],
  },
  {
    id: 2, name: "Aceite de transmisión manual", level: 0, parent: null, qb_id: null,
    children: [
      { id: 21, name: "SAE 75W-90", level: 1, parent: 2, qb_id: null },
      { id: 22, name: "SAE 80W-140", level: 1, parent: 2, qb_id: null },
    ],
  },
  {
    id: 3, name: "Kit de frenos", level: 0, parent: null, qb_id: null,
    children: [
      { id: 31, name: "Tambores (DRU)", level: 1, parent: 3, qb_id: null },
      { id: 32, name: "Discos (DSC)", level: 1, parent: 3, qb_id: null },
      { id: 33, name: "Zapatas (SHU)", level: 1, parent: 3, qb_id: null },
    ],
  },
  {
    id: 4, name: "Filtro de aire motor", level: 0, parent: null, qb_id: "AFL",
    children: [
      { id: 41, name: "Primario", level: 1, parent: 4, qb_id: null },
      { id: 42, name: "Secundario", level: 1, parent: 4, qb_id: null },
    ],
  },
  {
    id: 5, name: "Aditivo", level: 0, parent: null, qb_id: null,
    children: [
      { id: 51, name: "Para motor", level: 1, parent: 5, qb_id: null },
      { id: 52, name: "Para combustible", level: 1, parent: 5, qb_id: null },
    ],
  },
  {
    id: 6, name: "Anticongelante", level: 0, parent: null, qb_id: null,
    children: [
      { id: 61, name: "Concentrado", level: 1, parent: 6, qb_id: null },
      { id: 62, name: "Predilución 50/50", level: 1, parent: 6, qb_id: null },
    ],
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function getAllDescendantIds(node) {
  const ids = [node.id];
  if (node.children) node.children.forEach((c) => ids.push(...getAllDescendantIds(c)));
  return ids;
}

function filterTree(nodes, query) {
  if (!query) return nodes;
  return nodes.reduce((acc, node) => {
    const match = node.name.toLowerCase().includes(query.toLowerCase());
    const filteredChildren = node.children ? filterTree(node.children, query) : [];
    if (match || filteredChildren.length > 0) acc.push({ ...node, children: filteredChildren });
    return acc;
  }, []);
}

// ── CategoryRow ───────────────────────────────────────────────────────────────
function CategoryRow({ node, selected, onToggle, expanded, onExpand }) {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expanded.has(node.id);
  const isSelected = selected.has(node.id);

  const childIds = hasChildren ? node.children.map((c) => c.id) : [];
  const selectedChildCount = childIds.filter((id) => selected.has(id)).length;
  const allChildrenSelected = hasChildren && selectedChildCount === childIds.length;
  const someChildrenSelected = hasChildren && selectedChildCount > 0 && !allChildrenSelected;
  const effectiveSelected = isSelected || allChildrenSelected;

  const checkboxState = effectiveSelected ? true : someChildrenSelected ? "indeterminate" : false;

  return (
    <Collapsible open={isExpanded} onOpenChange={() => hasChildren && onExpand(node.id)}>

      {/* Fila padre */}
      <div className="flex items-center justify-between py-3 border-b border-white/6 cursor-pointer">
        <div
          className="flex items-center gap-2.5 flex-1"
          onClick={() => onToggle(node)}
        >
          {/* Checkbox */}
          <Checkbox
            checked={checkboxState}
            onCheckedChange={() => onToggle(node)}
            onClick={(e) => e.stopPropagation()}
            className={[
              "w-3 h-4 rounded-[3px] shrink-0 transition-all duration-150",
              // Borde
              effectiveSelected || someChildrenSelected
                ? "border-[#e63329]"
                : "border-white/20",
              // Fondo
              effectiveSelected
                ? "bg-[#e63329]"
                : someChildrenSelected
                ? "bg-[#e63329]/20"
                : "bg-transparent",
              // Overrides shadcn defaults
              "data-[state=checked]:bg-[#e63329] data-[state=checked]:border-[#e63329]",
              "data-[state=indeterminate]:bg-[#e63329]/20 data-[state=indeterminate]:border-[#e63329]",
            ].join(" ")}
          />

          {/* Label */}
          <span
            className={[
              "text-sm font-[Barlow,sans-serif] transition-colors",
              effectiveSelected ? "text-white font-semibold" : "text-white/78 font-normal",
            ].join(" ")}
          >
            {node.name}
            {node.qb_id && (
              <span className="text-white/30 font-normal"> ({node.qb_id})</span>
            )}
            {hasChildren && (
              <span className="text-white/[0.28] font-normal ml-1.5">
                ({selectedChildCount > 0 ? `${selectedChildCount}/` : ""}{childIds.length})
              </span>
            )}
          </span>
        </div>

        {/* Chevron */}
        {hasChildren && (
          <CollapsibleTrigger asChild>
            <button
              onClick={(e) => e.stopPropagation()}
              className="text-white/35 shrink-0 flex p-0.5 bg-transparent border-none cursor-pointer hover:text-white/60 transition-colors"
            >
              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
          </CollapsibleTrigger>
        )}
      </div>

      {/* Hijos */}
      {hasChildren && (
        <CollapsibleContent>
          {node.children.map((child) => (
            <div
              key={child.id}
              onClick={() => onToggle(child)}
              className="flex items-stretch py-2 cursor-pointer border-b border-white/3"
            >
              {/* Barra lateral */}
              <div
                className={[
                  "w-0.5 shrink-0 ml-0.5 mr-4 rounded-[1px] transition-colors duration-150 self-stretch",
                  selected.has(child.id) ? "bg-[#e63329]" : "bg-white/8",
                ].join(" ")}
              />
              <span
                className={[
                  "text-[13px] font-[Barlow,sans-serif] transition-colors duration-150",
                  selected.has(child.id)
                    ? "text-white/80 font-medium"
                    : "text-white/38 font-normal",
                ].join(" ")}
              >
                {child.name}
              </span>
            </div>
          ))}
        </CollapsibleContent>
      )}
    </Collapsible>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function CategoryFilter({ tree = DEMO_TREE, onChange }) {
  const [selected, setSelected] = useState(new Set());
  const [expanded, setExpanded] = useState(new Set());
  const [search, setSearch] = useState("");

  const handleToggle = useCallback((node) => {
    setSelected((prev) => {
      const next = new Set(prev);
      const ids = getAllDescendantIds(node);
      const allSelected = ids.every((id) => next.has(id));
      if (allSelected) ids.forEach((id) => next.delete(id));
      else ids.forEach((id) => next.add(id));
      onChange?.(Array.from(next));
      return next;
    });
  }, [onChange]);

  const handleExpand = useCallback((id) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const clearAll = () => { setSelected(new Set()); onChange?.([]); };

  const displayTree = useMemo(() => filterTree(tree, search), [tree, search]);

  const activeExpanded = useMemo(() => {
    if (!search) return expanded;
    const all = new Set();
    function collect(nodes) {
      nodes.forEach((n) => { all.add(n.id); if (n.children) collect(n.children); });
    }
    collect(tree);
    return all;
  }, [search, tree, expanded]);

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center p-10 font-[Barlow,sans-serif]">
      <div className="w-full max-w-77 bg-[#1a1a1a] rounded-[10px] overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,0.6)]">

        {/* ── Logo ── */}
        <div className="px-5 pt-5 pb-4 border-b border-white/[0.07]">
          <div className="flex items-center gap-2.5">
            <div className="bg-[#e63329] px-2 py-1 rounded-[3px] font-extrabold text-[15px] text-white tracking-[0.02em] font-[Barlow,sans-serif]">
              TONY
            </div>
            <span className="font-bold text-[15px] tracking-[0.06em] text-white font-[Barlow,sans-serif]">
              TRUCK<span className="text-[#e63329]">PART</span>
            </span>
          </div>
        </div>

        <div className="p-5">

          {/* ── Search ── */}
          <div className="mb-5">
            <p className="text-[10px] tracking-[0.14em] uppercase text-white/30 font-semibold mb-2.5 font-[Barlow,sans-serif]">
              Búsqueda
            </p>
            <div className="relative">
              <Search
                size={16}
                className="absolute left-2 top-1/2 -translate-y-1/2 text-white/[0.28] pointer-events-none"
              />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar repuestos..."
                className="
                  w-full bg-white/4 border border-white/10 rounded-[6px]
                  pl-8 pr-3 py-2.5 text-white text-[13px]
                  font-[Barlow,sans-serif] transition-colors duration-150
                  placeholder:text-white/28
                  focus-visible:ring-0 focus-visible:ring-offset-0
                  focus-visible:border-white/25
                "
              />
            </div>
          </div>

          {/* ── Separator ── */}
          <Separator className="bg-white/6 mb-5" />

          {/* ── Categories ── */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-0.5">
              <div className="flex items-center gap-1 text-[10px] tracking-[0.14em] uppercase text-white/30 font-semibold font-[Barlow,sans-serif]">
                Categorías
                <ChevronDown size={12} className="text-white/18" />
              </div>
              {selected.size > 0 && (
                <Badge
                  variant="outline"
                  className="text-[11px] text-[#e63329] font-semibold border-none bg-transparent p-0 h-auto"
                >
                  {selected.size} activos
                </Badge>
              )}
            </div>

            {/* ScrollArea */}
            <ScrollArea className="h-95">
              {displayTree.length === 0 ? (
                <p className="py-6 text-center text-white/20 text-[13px] font-[Barlow,sans-serif]">
                  Sin resultados para "{search}"
                </p>
              ) : (
                displayTree.map((node) => (
                  <CategoryRow
                    key={node.id}
                    node={node}
                    selected={selected}
                    onToggle={handleToggle}
                    expanded={activeExpanded}
                    onExpand={handleExpand}
                  />
                ))
              )}
            </ScrollArea>
          </div>

          {/* ── Reset ── */}
          <Button
            onClick={clearAll}
            disabled={selected.size === 0}
            className={[
              "w-full rounded-[6px] py-3.25 h-auto",
              "text-[12px] font-bold tracking-widest uppercase font-[Barlow,sans-serif]",
              "flex items-center justify-center gap-2 transition-all duration-200 border-none",
              selected.size > 0
                ? "bg-white text-[#111111] hover:bg-white/90 cursor-pointer"
                : "bg-white/6 text-white/22 cursor-default hover:bg-white/6",
            ].join(" ")}
          >
            <X size={16} />
            Reset filtros
          </Button>
        </div>
      </div>
    </div>
  );
}