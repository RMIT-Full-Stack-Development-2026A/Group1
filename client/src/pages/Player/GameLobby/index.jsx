// Route: /lobby
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useLobby } from "./hook/useLobby.hook.js";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { LobbyHeader, PlayerStats, RecentActivity, RoomGrid } from "./sub-components";

export default function GameLobby() {
    const navigate = useNavigate();
    const { isLoggedIn, loading: authLoading } = useAuth();
    const { rooms, playerStats, recentActivity, onlineCount, loading: lobbyLoading } = useLobby();

    // Redirect to landing page if not logged in
    useEffect(() => {
        if (!authLoading && !isLoggedIn) {
            navigate("/");
        }
    }, [isLoggedIn, authLoading, navigate]);

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

    if (authLoading || lobbyLoading) {
        return (
            <div className="bg-[#0d0d1a] text-[#e3e0f4] min-h-screen flex items-center justify-center">
                <div className="font-mono text-[#4cc9f0]">Loading...</div>
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