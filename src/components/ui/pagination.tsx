"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/format";

type PaginationProps = {
  page: number;
  totalPages: number;
  total?: number;
  onPageChange: (page: number) => void;
  showSummary?: boolean;
  summaryLabel?: string;
  className?: string;
  variant?: "default" | "compact";
};

function getPageNumbers(page: number, totalPages: number) {
  if (totalPages <= 1) return [] as number[];
  const start = Math.max(1, Math.min(page - 1, totalPages - 2));
  return [start, start + 1, start + 2].filter((item) => item <= totalPages);
}

export function Pagination({
  page,
  totalPages,
  total,
  onPageChange,
  showSummary = true,
  summaryLabel,
  className,
  variant = "default",
}: PaginationProps) {
  const pageNumbers = useMemo(() => getPageNumbers(page, totalPages), [page, totalPages]);

  if (totalPages <= 1) {
    if (!showSummary || total === undefined) return null;
    return (
      <div className={cn("flex flex-wrap items-center justify-between gap-3", className)}>
        <p className="text-sm text-stone-500">
          {formatNumber(total)} {summaryLabel ?? ""}
          {summaryLabel && total === 1 ? "" : summaryLabel ? "s" : ""}
        </p>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={cn("flex flex-wrap items-center justify-between gap-3", className)}>
        {showSummary ? (
          <p className="text-sm text-stone-500">
            {total !== undefined ? formatNumber(total) : 0} {summaryLabel ?? ""}
            {summaryLabel && total === 1 ? "" : summaryLabel ? "s" : ""}
            {` · page ${page} of ${totalPages}`}
          </p>
        ) : (
          <span />
        )}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6", className)}>
      {showSummary ? (
        <p className="text-sm text-stone-500">
          Page {page} of {totalPages}
          {total !== undefined ? ` · ${formatNumber(total)} total` : ""}
        </p>
      ) : (
        <span />
      )}
      <div className="flex flex-wrap items-center justify-center gap-1.5 sm:justify-end">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ArrowLeft className="h-4 w-4" />
          Previous
        </Button>
        {pageNumbers.map((item) => (
          <Button
            key={item}
            variant={item === page ? "primary" : "outline"}
            size="sm"
            className="w-9 px-0"
            onClick={() => onPageChange(item)}
          >
            {item}
          </Button>
        ))}
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
