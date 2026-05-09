import React from "react";

export default function PlayerManagementPagination({ page, totalPlayers, pageSize, onPageChange }) {
	const totalPages = Math.max(1, Math.ceil((totalPlayers || 0) / pageSize));
	const startIndex = totalPlayers === 0 ? 0 : (page - 1) * pageSize + 1;
	const endIndex = Math.min(page * pageSize, totalPlayers);
	const leftPage = Math.max(1, page - 1);
	const middlePage = Math.min(totalPages, page);
	const rightPage = Math.min(totalPages, page + 1);

	return (
		<section className="flex flex-col gap-4 border border-outline-variant bg-surface-container p-4 font-['IBM_Plex_Mono'] md:flex-row md:items-center md:justify-between">
			<span className="text-[10px] uppercase tracking-widest text-outline">
				Displaying {startIndex}-{endIndex} of {totalPlayers.toLocaleString()} MEMBERS
			</span>

			<div className="flex gap-1">
				<button type="button" onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page <= 1} className="flex h-8 w-8 items-center justify-center border border-outline-variant text-outline transition-all hover:border-primary hover:text-primary active:translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Previous page">
					<span className="material-symbols-outlined text-sm">chevron_left</span>
				</button>

				{page > 1 && (
					<button type="button" onClick={() => onPageChange(page - 1)} className={`h-8 w-8 border text-xs font-bold border-outline-variant text-outline transition-all hover:border-primary hover:text-primary`}>
						{String(page - 1).padStart(2, "0")}
					</button>
				)}

				<button type="button" onClick={() => onPageChange(page)} className={`h-8 w-8 border text-xs font-bold ${page === page ? "border-primary bg-primary/10 text-primary" : "border-outline-variant text-outline"}`}>
					{String(page).padStart(2, "0")}
				</button>

				{page < totalPages && (
					<button type="button" onClick={() => onPageChange(page + 1)} className={`h-8 w-8 border text-xs font-bold border-outline-variant text-outline transition-all hover:border-primary hover:text-primary`}>
						{String(page + 1).padStart(2, "0")}
					</button>
				)}

				<button type="button" onClick={() => onPageChange(Math.min(totalPages, page + 1))} disabled={page >= totalPages} className="flex h-8 w-8 items-center justify-center border border-outline-variant text-outline transition-all hover:border-primary hover:text-primary active:translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Next page">
					<span className="material-symbols-outlined text-sm">chevron_right</span>
				</button>
			</div>
		</section>
	);
}
