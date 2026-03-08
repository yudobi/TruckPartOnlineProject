import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// ─── Props ────────────────────────────────────────────────────────────────────

interface ProductPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ProductPagination({
  currentPage,
  totalPages,
  onPageChange,
}: ProductPaginationProps) {
  if (totalPages <= 1) return null;

  const getVisiblePages = (): (number | string)[] => {
    const delta = 2;
    const range: number[] = [];
    const rangeWithDots: (number | string)[] = [];
    let l: number | undefined;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
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

  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem className="text-red-500">
          <PaginationPrevious
            onClick={() => hasPrevious && onPageChange(currentPage - 1)}
            className={
              !hasPrevious ? "pointer-events-none opacity-50" : "cursor-pointer"
            }
            aria-label="Página anterior"
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
                aria-label={`Página ${page}`}
                aria-current={currentPage === page ? "page" : undefined}
              >
                {page}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}
        <PaginationItem className="text-red-500">
          <PaginationNext
            onClick={() => hasNext && onPageChange(currentPage + 1)}
            className={
              !hasNext ? "pointer-events-none opacity-50" : "cursor-pointer"
            }
            aria-label="Página siguiente"
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

export default ProductPagination;
