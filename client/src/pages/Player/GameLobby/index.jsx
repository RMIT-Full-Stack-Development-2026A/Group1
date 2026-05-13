// Route: /lobby
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth/AuthStore";
import { useModeStore } from "@/stores/ai/ModeStore";
import { useLobby } from "@/pages/Player/GameLobby/hook/useLobby.hook.js";
import { LobbyHeader, PlayerStats, RecentActivity, RoomGrid } from "./sub-components";

export default function GameLobby() {
    const navigate = useNavigate();
    const { isAuthenticated, isCheckingAuth } = useAuthStore();
    const { setGameMode } = useModeStore();
    const { rooms, onlineCount, loading: lobbyLoading, error: lobbyError, usingMockData, refreshLobby } = useLobby();

    // Redirect to landing page if not logged in (but wait for auth check to complete)
    useEffect(() => {
        // Only redirect after auth check is complete AND user is not logged in
        if (!isCheckingAuth && !isAuthenticated) {
            navigate("/", { replace: true }); // Use replace to avoid history buildup
        }
    }, [isAuthenticated, isCheckingAuth, navigate]);

    const handleJoinRoom = (roomId) => {
        const room = rooms.find((r) => r.id === roomId);
        if (room && room.status === "waiting") {
            navigate(`/play/online/${roomId}`, { state: { room } });
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
                />

                {/* Room Grid */}
                <RoomGrid
                    rooms={rooms}
                    onJoinRoom={handleJoinRoom}
                    onCreateRoom={handleCreateRoom}
                />
            </main>
        </div>
    );
}