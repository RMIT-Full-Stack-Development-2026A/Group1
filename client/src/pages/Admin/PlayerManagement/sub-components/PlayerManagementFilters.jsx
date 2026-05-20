import React from "react";

export default function PlayerManagementFilters({
	searchTerm,
	setSearchTerm,
	statusFilter,
	setStatusFilter,
	statusFilterOptions,
	onExecuteSearch,
	onResetFilters,
	isLoading = false,
}) {
	return (
		<section className="relative overflow-hidden border border-outline-variant bg-surface-card p-6 shadow-[4px_4px_0px_0px_#1e1e2c]">
			<div className="absolute left-0 top-0 h-0.5 w-16 bg-primary" />
			<div className="flex flex-col gap-4 md:flex-row md:items-end">
				<label className="relative flex-1">
					<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-outline">
						search
					</span>
					<input
						type="text"
						value={searchTerm}
						onChange={(event) => setSearchTerm(event.target.value)}
						placeholder="SEARCH BY USERNAME OR EMAIL..."
						className="w-full border-b-2 border-outline-variant bg-surface-container-highest py-3 pl-10 pr-4 font-['IBM_Plex_Mono'] text-xs text-on-surface outline-none transition-colors placeholder:text-outline/50 focus:border-primary"
					/>
				</label>

				<label className="relative md:w-64">
					<select
						value={statusFilter}
						onChange={(event) => setStatusFilter(event.target.value)}
						className="w-full cursor-pointer appearance-none border-b-2 border-outline-variant bg-surface-container-highest px-4 py-3 font-['IBM_Plex_Mono'] text-xs text-on-surface outline-none transition-colors focus:border-primary"
						style={{ fontFamily: "'IBM Plex Mono', monospace" }}
					>
						{statusFilterOptions.map((option) => (
							<option key={option.value || "all"} value={option.value} style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
								{option.label}
							</option>
						))}
					</select>
					<span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-outline">
						expand_more
					</span>
				</label>

				<div className="flex gap-3 md:ml-auto">
					<button
						type="button"
						onClick={onResetFilters}
						disabled={isLoading}
						className="border-b-2 border-r-2 border-outline-variant bg-surface-container-highest px-8 py-3 text-xs font-bold uppercase tracking-widest text-on-surface transition-all hover:brightness-110 active:translate-x-px active:translate-y-px active:shadow-none"
					>
						RESET FILTER
					</button>

					<button
						type="button"
						onClick={onExecuteSearch}
						disabled={isLoading}
						className="border-b-2 border-r-2 border-on-primary-container bg-primary-container px-8 py-3 text-xs font-bold uppercase tracking-widest text-on-primary transition-all hover:brightness-110 active:translate-x-px active:translate-y-px active:shadow-none"
					>
						{isLoading ? "LOADING..." : "Execute Search"}
					</button>
				</div>
			</div>
		</section>
	);
}
