import React from "react";
import { useGameRoomMonitor } from "./hooks/useGameRoomMonitor";
import GameRoomMonitorHeader from "./sub-components/GameRoomMonitorHeader";
import GameRoomMonitorFilters from "./sub-components/GameRoomMonitorFilters";
import GameRoomMonitorStats from "./sub-components/GameRoomMonitorStats";
import GameRoomGrid from "./sub-components/GameRoomGrid";

export default function GameRoomMonitor() {
	const {
		rooms,
		searchTerm,
		setSearchTerm,
		resetSearch,
		refreshRooms,
		loading,
		error,
		closeRoom,
		closingRoomId,
		totalRooms,
		activeRooms,
		waitingRooms,
		inProgressRooms,
		closedRooms,
		visibleRooms,
	} = useGameRoomMonitor();

	return (
		<main className="relative mx-auto w-full max-w-360 px-4 py-8 font-body text-on-surface md:px-8 md:py-10">
			<div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(13,13,26,0.2),rgba(13,13,26,0.2)),radial-gradient(circle_at_top_right,rgba(76,201,240,0.08),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(255,214,10,0.06),transparent_28%)]" />

			<div className="relative z-10 space-y-8">
				<GameRoomMonitorHeader
					totalRooms={totalRooms}
					activeRooms={activeRooms}
					closedRooms={closedRooms}
					onRefresh={refreshRooms}
				/>

				{error && (
					<div className="border border-error-container bg-error/10 px-4 py-3 font-['IBM_Plex_Mono'] text-xs uppercase tracking-widest text-error">
						{error}
					</div>
				)}

				<GameRoomMonitorStats
					activeRooms={activeRooms}
					waitingRooms={waitingRooms}
					inProgressRooms={inProgressRooms}
					closedRooms={closedRooms}
				/>

				<GameRoomMonitorFilters
					searchTerm={searchTerm}
					setSearchTerm={setSearchTerm}
					onResetSearch={resetSearch}
					onRefresh={refreshRooms}
					loading={loading}
				/>

				<GameRoomGrid
					rooms={rooms}
					onCloseRoom={closeRoom}
					closingRoomId={closingRoomId}
					loading={loading}
				/>
			</div>
		</main>
	);
}