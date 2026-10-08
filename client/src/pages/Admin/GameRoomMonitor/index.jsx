import React from "react";
import { useSearchParams } from "react-router-dom";
import { readParam, readPositiveInt, writeParams } from "@/utils/urlState";
import { useGameRoomMonitor } from "./hooks/useGameRoomMonitor";
import { useGameSessionMonitor } from "./hooks/useGameSessionMonitor";
import GameRoomMonitorHeader from "./sub-components/GameRoomMonitorHeader";
import GameRoomMonitorFilters from "./sub-components/GameRoomMonitorFilters";
import GameSessionMonitorFilters from "./sub-components/GameSessionMonitorFilters";
import GameRoomMonitorStats from "./sub-components/GameRoomMonitorStats";
import GameRoomGrid from "./sub-components/GameRoomGrid";
import GameSessionGrid from "./sub-components/GameSessionGrid";
import GameRoomMonitorPagination from "./sub-components/GameRoomMonitorPagination";
import GameSessionMonitorStats from "./sub-components/GameSessionMonitorStats";

const SESSION_FILTER_PARAMS = { sessionNumber: "sn", q: "sq", from: "from", to: "to", status: "status" };

const readSessionFilters = (params) =>
	Object.fromEntries(
		Object.entries(SESSION_FILTER_PARAMS)
			.map(([key, param]) => [key, readParam(params, param)])
			.filter(([, value]) => value !== "")
	);

export default function GameRoomMonitor() {
	// The view, filters and pages live in the URL so a monitor view can be shared and survives reload.
	const [searchParams, setSearchParams] = useSearchParams();
	const getSessionStatus = (session) => String(session?.viewerResult || session?.status || "").toUpperCase();

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
		page: roomPage,
		totalPages: roomTotalPages,
		changePage: changeRoomPage,
		pageSize: roomPageSize,
		visiblePageRooms,
	} = useGameRoomMonitor({
		initialSearch: readParam(searchParams, "rq"),
		initialPage: readPositiveInt(searchParams, "rpage"),
	});

	const [sessionFilters, setSessionFilters] = React.useState(() => readSessionFilters(searchParams));
	const {
		sessions,
		loading: sessionsLoading,
		refreshSessions,
		error: sessionsError,
		allSessions,
		totalSessions,
		page: sessionPage,
		totalPages: sessionTotalPages,
		changePage: changeSessionPage,
		pageSize: sessionPageSize,
	} = useGameSessionMonitor(sessionFilters, readPositiveInt(searchParams, "spage"));
	const activeSessions = allSessions.filter((session) => !["FINISHED", "DRAW", "ABORTED"].includes(getSessionStatus(session))).length;
	const closedSessions = allSessions.filter((session) => ["FINISHED", "DRAW", "ABORTED"].includes(getSessionStatus(session))).length;

	const [selectedView, setSelectedView] = React.useState(() =>
		readParam(searchParams, "view") === "sessions" ? "sessions" : "rooms"
	);

	React.useEffect(() => {
		writeParams(setSearchParams, {
			view: [selectedView, "rooms"],
			rq: [searchTerm.trim(), ""],
			rpage: [roomPage, 1],
			sn: [sessionFilters.sessionNumber || "", ""],
			sq: [sessionFilters.q || "", ""],
			from: [sessionFilters.from || "", ""],
			to: [sessionFilters.to || "", ""],
			status: [sessionFilters.status || "", ""],
			spage: [sessionPage, 1],
		});
	}, [selectedView, searchTerm, roomPage, sessionFilters, sessionPage, setSearchParams]);

	return (
		<main className="relative mx-auto w-full max-w-360 px-4 py-8 font-body text-on-surface md:px-8 md:py-10">
			<div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(13,13,26,0.2),rgba(13,13,26,0.2)),radial-gradient(circle_at_top_right,rgba(76,201,240,0.08),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(255,214,10,0.06),transparent_28%)]" />

			<div className="relative z-10 space-y-8">
				<GameRoomMonitorHeader
					totalRooms={selectedView === "rooms" ? totalRooms : totalSessions}
					activeRooms={selectedView === "rooms" ? activeRooms : activeSessions}
					closedRooms={selectedView === "rooms" ? closedRooms : closedSessions}
					onRefresh={() => (selectedView === "rooms" ? refreshRooms() : refreshSessions(1, sessionFilters))}
					selectedView={selectedView}
					onChangeView={(v) => setSelectedView(v)}
				/>

				{(selectedView === "rooms" ? error : sessionsError) && (
					<div className="border border-error-container bg-error/10 px-4 py-3 font-['IBM_Plex_Mono'] text-xs uppercase tracking-widest text-error">
						{selectedView === "rooms" ? error : sessionsError}
					</div>
				)}

				{selectedView === "rooms" ? (
					<GameRoomMonitorStats
						activeRooms={activeRooms}
						waitingRooms={waitingRooms}
						inProgressRooms={inProgressRooms}
						closedRooms={closedRooms}
					/>
				) : (
					<GameSessionMonitorStats sessions={allSessions} />
				)}

								{selectedView === "rooms" && (
									<GameRoomMonitorFilters
										searchTerm={searchTerm}
										setSearchTerm={setSearchTerm}
										onResetSearch={resetSearch}
										onRefresh={refreshRooms}
										loading={loading}
									/>
								)}

								{selectedView === "sessions" && (
									<GameSessionMonitorFilters
										initialFilters={sessionFilters}
										onApply={(f) => setSessionFilters(f || {})}
										onRefresh={() => refreshSessions(1, sessionFilters)}
										loading={sessionsLoading}
									/>
								)}

				{selectedView === "rooms" ? (
					<GameRoomGrid
						rooms={visiblePageRooms}
						onCloseRoom={closeRoom}
						closingRoomId={closingRoomId}
						loading={loading}
					/>
				) : (
					<GameSessionGrid sessions={sessions} loading={sessionsLoading} />
				)}

				{selectedView === "sessions" && (
					<GameRoomMonitorPagination
						page={sessionPage}
						totalPages={sessionTotalPages}
						totalItems={totalSessions}
						pageSize={sessionPageSize}
						onPageChange={changeSessionPage}
						label="SESSIONS"
					/>
				)}

				{selectedView === "rooms" && (
					<GameRoomMonitorPagination
						page={roomPage}
						totalPages={roomTotalPages}
						totalItems={rooms.length}
						pageSize={roomPageSize}
						onPageChange={changeRoomPage}
						label="ROOMS"
					/>
				)}
			</div>
		</main>
	);
}