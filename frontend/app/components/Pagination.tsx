"use client";

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { QUERY_LIMITS } from "@/lib/query.lib";

interface PaginationProps {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  onPage: (page: number) => void;
  onLimit: (limit: number) => void;
  label?: string;
}

export function Pagination({
  page, limit, total, totalPages, onPage, onLimit, label = "results",
}: PaginationProps) {
  const from = total === 0 ? 0 : Math.min((page - 1) * limit + 1, total);
  const to   = Math.min(page * limit, total);
  const pages = buildPageRange(page, totalPages);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1">
      <div className="flex items-center gap-3 order-2 sm:order-1">
        <p className="text-xs text-muted-foreground">
          Showing{" "}
          <span className="font-semibold text-foreground">{from}–{to}</span> of{" "}
          <span className="font-semibold text-foreground">{total.toLocaleString()}</span>{" "}
          {label}
        </p>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">Per page:</span>
          <select
            value={limit}
            onChange={(e) => onLimit(Number(e.target.value))}
            className="text-xs font-semibold border border-border rounded-lg px-2 py-1 bg-background focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
          >
            {QUERY_LIMITS.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-1 order-1 sm:order-2">
        <NavBtn onClick={() => onPage(1)} disabled={page <= 1} aria="First page">
          <ChevronsLeft size={14} />
        </NavBtn>
        <NavBtn onClick={() => onPage(page - 1)} disabled={page <= 1} aria="Previous page">
          <ChevronLeft size={14} />
        </NavBtn>

        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`e-${i}`} className="w-8 text-center text-muted-foreground text-sm select-none">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPage(p as number)}
              className={`w-8 h-8 rounded-lg text-xs font-semibold transition ${
                p === page
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {p}
            </button>
          )
        )}

        <NavBtn onClick={() => onPage(page + 1)} disabled={page >= totalPages} aria="Next page">
          <ChevronRight size={14} />
        </NavBtn>
        <NavBtn onClick={() => onPage(totalPages)} disabled={page >= totalPages} aria="Last page">
          <ChevronsRight size={14} />
        </NavBtn>
      </div>
    </div>
  );
}

function NavBtn({ onClick, disabled, aria, children }: {
  onClick: () => void;
  disabled: boolean;
  aria: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={aria}
      className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition disabled:opacity-30 disabled:cursor-not-allowed"
    >
      {children}
    </button>
  );
}

function buildPageRange(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "…")[] = [1];
  if (current > 3) pages.push("…");
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) {
    pages.push(p);
  }
  if (current < total - 2) pages.push("…");
  pages.push(total);
  return pages;
}