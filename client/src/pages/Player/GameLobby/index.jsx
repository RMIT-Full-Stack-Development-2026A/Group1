// Route: /lobby
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/AuthStore";
import { useLobby } from "./hook/useLobby.hook.js";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { LobbyHeader, PlayerStats, RecentActivity, RoomGrid } from "./sub-components";

export default function GameLobby() {
    const navigate = useNavigate();
    const { isAuthenticated, isCheckingAuth } = useAuthStore();
    const { rooms, playerStats, recentActivity, onlineCount, loading: lobbyLoading, error: lobbyError, usingMockData } = useLobby();

    // Redirect to landing page if not logged in (but wait for auth check to complete)
    useEffect(() => {
        // Only redirect after auth check is complete AND user is not logged in
        if (!isCheckingAuth && !isAuthenticated) {
            navigate("/", { replace: true }); // Use replace to avoid history buildup
        }
    }, [isAuthenticated, isCheckingAuth, navigate]);

    const handleJoinRoom = (roomId) => {
        const room = rooms.find((r) => r.id === roomId);
        if (room && room.status !== "full") {
            navigate(`/play/${roomId}`, { state: { room } });
        }
    };

    const handleCreateRoom = () => {
        navigate("/game-customization");
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
            <div className="bg-[#0d0d1a] text-[#e3e0f4] min-h-screen flex items-center justify-center">
                <div className="font-mono text-[#4cc9f0]">Loading Lobby...</div>
            </div>
        );
    }

    // Show error if lobby data failed to load
    if (lobbyError) {
        return (
            <div className="bg-[#0d0d1a] text-[#e3e0f4] font-body min-h-screen flex flex-col">
                <Navigation />
                <main className="flex-grow flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-[#ffb4ab] mb-4">❌ Failed to load lobby</div>
                        <div className="text-[#879398] text-sm mb-6">{lobbyError}</div>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-[#4cc9f0] text-[#003543] px-6 py-2 font-bold hover:opacity-80"
                        >
                            Retry
                        </button>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="bg-[#0d0d1a] text-[#e3e0f4] font-body min-h-screen flex flex-col overflow-x-hidden">
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

            {/* Navigation */}
            <Navigation />

            {/* Mock Data Warning Banner */}
            {usingMockData && !lobbyError && (
                <div className="bg-[#fad100]/20 border-b border-[#fad100] text-[#fad100] px-6 py-3 text-center text-sm font-mono tracking-tight">
                    ⚠️ DEMO MODE: Showing example data. Backend endpoints not yet implemented.
                </div>
            )}

            {/* Main Content */}
            <main className="grow flex flex-col md:flex-row p-6 gap-6 relative z-10 pt-20">
                {/* Left Sidebar: Player Stats */}
                <aside className="w-full md:w-80 flex flex-col gap-6">
                    {playerStats && <PlayerStats stats={playerStats} />}
                    {recentActivity && <RecentActivity activities={recentActivity} />}
                </aside>

                {/* Main Content Area */}
                <section className="grow flex flex-col gap-8">
                    {/* Header with Controls */}
                    <LobbyHeader
                        onlineCount={onlineCount}
                        onCreateRoom={handleCreateRoom}
                        onQuickJoin={handleQuickJoin}
                    />

                    {/* Room Grid */}
                    <RoomGrid
                        rooms={rooms}
                        onJoinRoom={handleJoinRoom}
                        onCreateRoom={handleCreateRoom}
                    />
                </section>
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}