import React from "react";

export default function GameRoomMonitorPagination({ page, totalPages, totalItems, pageSize, onPageChange, label = "ROOMS" }) {
  const safeTotalPages = Math.max(1, totalPages || 1);
  const safePage = Math.min(Math.max(1, page || 1), safeTotalPages);
  const startIndex = totalItems === 0 ? 0 : Math.min((safePage - 1) * pageSize + 1, totalItems);
  const endIndex = totalItems === 0 ? 0 : Math.min(safePage * pageSize, totalItems);

  return (
    <section className="flex flex-col gap-4 border border-outline-variant bg-surface-card p-4 font-mono md:flex-row md:items-center md:justify-between">
      <span className="text-[10px] uppercase tracking-widest text-outline">
        Displaying {startIndex}-{endIndex} of {totalItems.toLocaleString()} {label}
      </span>

      <div className="flex gap-1">
        <button
          type="button"
          onClick={() => onPageChange(safePage - 1)}
          disabled={safePage <= 1}
          className="flex h-8 w-8 items-center justify-center border border-outline-variant text-outline transition-all hover:border-primary hover:text-primary active:translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Previous page"
        >
          <span className="material-symbols-outlined text-sm">chevron_left</span>
        </button>

        <button
          type="button"
          onClick={() => onPageChange(safePage)}
          className="h-8 min-w-8 border border-primary bg-primary/10 px-2 text-xs font-bold text-primary"
        >
          {String(safePage).padStart(2, "0")}
        </button>

        <button
          type="button"
          onClick={() => onPageChange(safePage + 1)}
          disabled={safePage >= safeTotalPages}
          className="flex h-8 w-8 items-center justify-center border border-outline-variant text-outline transition-all hover:border-primary hover:text-primary active:translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Next page"
        >
          <span className="material-symbols-outlined text-sm">chevron_right</span>
        </button>
      </div>
    </section>
  );
}
