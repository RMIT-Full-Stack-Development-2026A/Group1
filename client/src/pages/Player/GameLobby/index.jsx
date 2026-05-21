// Route: /lobby
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth/AuthStore";
import { useModeStore } from "@/stores/ai/ModeStore";
import { useLobby } from "@/pages/Player/GameLobby/hook/useLobby.hook.js";
import { LobbyHeader, PlayerStats, RecentActivity, RoomGrid } from "./sub-components";

export default function GameLobby() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { isAuthenticated, isCheckingAuth } = useAuthStore();
    const { setGameMode } = useModeStore();
    const [page, setPage] = useState(1);
    const [showWaitingOnly, setShowWaitingOnly] = useState(false);
    const { rooms, onlineCount, loading: lobbyLoading, error: lobbyError, usingMockData, refreshLobby, pagination } = useLobby({
        page,
        limit: 9,
        waitingOnly: showWaitingOnly,
    });

    // Redirect to landing page if not logged in (but wait for auth check to complete)
    useEffect(() => {
        // Only redirect after auth check is complete AND user is not logged in
        if (!isCheckingAuth && !isAuthenticated) {
            navigate("/", { replace: true }); // Use replace to avoid history buildup
        }
    }, [isAuthenticated, isCheckingAuth, navigate]);

    const handleJoinRoom = (roomId) => {
        const room = rooms.find((r) => r.id === roomId);
        if (!room) return;

        if (room.status === 'waiting') {
            navigate(`/room/online/${roomId}`, { state: { room } });
            return;
        }

        if (room.status === 'playing') {
            // Rejoin — only navigate if current user is a participant in this room
            const isParticipant = Array.isArray(room.participantIds) &&
                room.participantIds.includes(String(user?.id));
            if (isParticipant) {
                // No location state needed — useGameOnline will emit room:join and backend
                // will respond with game:state for the current board.
                navigate(`/room/online/${roomId}`);
            }
            // If not a participant, do nothing (button should already be disabled in RoomCard)
        }
    };

    const handleCreateRoom = () => {
        // Set game mode to online match before navigating
        setGameMode('ONLINE_MATCH');
        navigate("/customize");
    };

    const handleQuickJoin = () => {
        const availableRooms = rooms.filter((r) => r.status === "waiting");
        if (availableRooms.length > 0) {
            const randomRoom = availableRooms[Math.floor(Math.random() * availableRooms.length)];
            handleJoinRoom(randomRoom.id);
        }
    };

    const activePlayingRoom = rooms.find(
        (r) => r.status === 'playing' && Array.isArray(r.participantIds) && r.participantIds.includes(String(user?.id))
    );

    const visibleRooms = useMemo(() => {
        if (!showWaitingOnly) return rooms;

        return rooms.filter((room) => String(room.status || '').toLowerCase() === 'waiting');
    }, [rooms, showWaitingOnly]);

    if (isCheckingAuth || lobbyLoading) {
        return (
            <div className="bg-deep-bg text-on-surface min-h-screen flex items-center justify-center">
                <div className="font-mono text-primary-cyan">Loading Lobby...</div>
            </div>
        );
    }

    // Show error if lobby data failed to load
    if (lobbyError) {
        return (
            <div className="bg-deep-bg text-on-surface font-body min-h-screen flex flex-col">
                <main className="grow flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-error mb-4">Failed to load lobby</div>
                        <div className="text-outline text-sm mb-6">{lobbyError}</div>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-primary-cyan text-on-primary px-6 py-2 font-bold hover:opacity-80"
                        >
                            Retry
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="bg-deep-bg text-on-surface font-body min-h-screen flex flex-col overflow-x-hidden">
            {/* Background Grid Pattern */}
            <div
                className="fixed inset-0 opacity-10 pointer-events-none"
                style={{
                    backgroundImage: "radial-gradient(circle, #3d484d 1px, transparent 1px)",
                    backgroundSize: "24px 24px",
                }}
            ></div>

            {/* Scanline effect */}
            <div
                className="fixed inset-0 opacity-20 pointer-events-none"
                style={{
                    background: "linear-gradient(to bottom, rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%)",
                    backgroundSize: "100% 4px",
                }}
            ></div>

            {/* Active Match Warning Banner */}
            {activePlayingRoom && (
                <div className="bg-[#ff3d00]/20 border-y-2 border-[#ff3d00] p-4 relative z-40 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-[0_0_30px_rgba(255,61,0,0.15)] backdrop-blur-sm">
                    <div className="text-center sm:text-left">
                        <h2 className="text-[#ff3d00] font-headline text-lg sm:text-md tracking-widest mb-1 shadow-[#ff3d00]">
                            WARNING: YOU HAVE AN ONGOING MATCH!
                        </h2>
                        <p className="text-[#e3e0f4] font-mono text-sm tracking-tight opacity-90">
                            You have a limited grace period to return before the match is aborted.
                        </p>
                    </div>
                    <button
                        onClick={() => handleJoinRoom(activePlayingRoom.id)}
                        className="bg-[#ff3d00] text-[#1a0a0a] hover:bg-[#ff5722] hover:scale-105 active:scale-95 transition-all font-headline tracking-widest px-8 py-3 w-full sm:w-auto shadow-[0_0_15px_rgba(255,61,0,0.5)] border border-[#ff3d00]"
                    >
                        REJOIN MATCH
                    </button>
                </div>
            )}

            {/* Mock Data Warning Banner */}
            {usingMockData && !lobbyError && (
                <div className="bg-surface-container-low border-b border-primary-cyan text-primary-cyan px-6 py-3 text-center text-sm font-mono tracking-tight">
                    DEMO MODE: Showing example data. Backend endpoints not yet implemented.
                </div>
            )}

            {/* Main Content */}
            <main className="grow flex flex-col p-6 relative z-10">
                {/* Header with Controls */}
                <LobbyHeader
                    onlineCount={onlineCount}
                    onCreateRoom={handleCreateRoom}
                    onQuickJoin={handleQuickJoin}
                    onRefreshLobby={refreshLobby}
                    showWaitingOnly={showWaitingOnly}
                    onToggleShowWaitingOnly={() => {
                        setShowWaitingOnly((value) => !value);
                        setPage(1);
                    }}
                />

                {/* Room Grid */}
                <RoomGrid
                    rooms={visibleRooms}
                    onJoinRoom={handleJoinRoom}
                    onCreateRoom={handleCreateRoom}
                    currentUserId={user?.id}
                    pagination={pagination}
                    onPageChange={setPage}
                />
            </main>
        </div>
    );
}