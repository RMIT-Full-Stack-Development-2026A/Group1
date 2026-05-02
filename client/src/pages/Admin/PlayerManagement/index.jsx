// Route: /admin/players
import React from "react";
import { usePlayerManagement } from "./hooks/usePlayerManagement";
import PlayerManagementHeader from "./sub-components/PlayerManagementHeader";
import PlayerManagementFilters from "./sub-components/PlayerManagementFilters";
import PlayerManagementTable from "./sub-components/PlayerManagementTable";
import PlayerManagementPagination from "./sub-components/PlayerManagementPagination";

export default function PlayerManagement() {
	const {
		players,
		searchTerm,
		setSearchTerm,
		statusFilter,
		setStatusFilter,
		statusFilterOptions,
		executeSearch,
		resetFilters,
		loading,
		error,
		page,
		pageSize,
		totalPlayers,
		goToPage,
		togglePlayerStatus,
		actionLoadingId,
		fromIndex,
		toIndex,
	} = usePlayerManagement();

	return (
		<main className="relative mx-auto w-full max-w-7xl px-4 py-10 text-on-surface md:px-8 md:py-12">
			<div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(13,13,26,0.2),rgba(13,13,26,0.2)),radial-gradient(circle_at_top_right,rgba(76,201,240,0.08),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(255,214,10,0.06),transparent_28%)]" />

			<div className="relative z-10 space-y-8">
				<PlayerManagementHeader />
				{error && (
					<div className="border border-error-container bg-error/10 px-4 py-3 font-['IBM_Plex_Mono'] text-xs uppercase tracking-widest text-error">
						{error}
					</div>
				)}
				<PlayerManagementFilters
					searchTerm={searchTerm}
					setSearchTerm={setSearchTerm}
					statusFilter={statusFilter}
					setStatusFilter={setStatusFilter}
					statusFilterOptions={statusFilterOptions}
					onExecuteSearch={executeSearch}
					onResetFilters={resetFilters}
					isLoading={loading}
				/>
				<PlayerManagementTable
					players={players}
					loading={loading}
					onToggleStatus={togglePlayerStatus}
					actionLoadingId={actionLoadingId}
				/>
				<PlayerManagementPagination
					page={page}
					totalPlayers={totalPlayers}
					pageSize={pageSize}
					onPageChange={goToPage}
					fromIndex={fromIndex}
					toIndex={toIndex}
				/>
			</div>
		</main>
	);
}
