import { memo } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// ─── Component ────────────────────────────────────────────────────────────────

export const ProductSkeleton = memo(function ProductSkeleton() {
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
});

export default ProductSkeleton;
