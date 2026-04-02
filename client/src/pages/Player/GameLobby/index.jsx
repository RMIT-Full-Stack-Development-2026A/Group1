// Route: /lobby
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

export default function GameLobby() {
    const navigate = useNavigate();
    const { isLoggedIn, loading } = useAuth();
    const [rooms, setRooms] = useState([
        {
            id: 1,
            roomNumber: 42,
            boardSize: "10x10",
            host: "PLAYER_ONE",
            hostRank: "#085",
            status: "waiting",
            players: 1,
            maxPlayers: 2,
        },
        {
            id: 2,
            roomNumber: 45,
            boardSize: "15x15",
            host: "NEON_PHANTOM",
            hostRank: "#042",
            status: "waiting",
            players: 1,
            maxPlayers: 2,
        },
        {
            id: 3,
            roomNumber: 39,
            boardSize: "10x10",
            host: "HOST_X",
            hostRank: "#151",
            status: "full",
            players: 2,
            maxPlayers: 2,
        },
        {
            id: 4,
            roomNumber: 46,
            boardSize: "10x10",
            host: "CYBER_KING",
            hostRank: "#037",
            status: "waiting",
            players: 1,
            maxPlayers: 2,
        },
        {
            id: 5,
            roomNumber: 47,
            boardSize: "15x15",
            host: "ZERO_COOL",
            hostRank: "#089",
            status: "waiting",
            players: 1,
            maxPlayers: 2,
        },
        {
            id: 6,
            roomNumber: 48,
            boardSize: "10x10",
            host: "BIT_CRUSHER",
            hostRank: "#076",
            status: "waiting",
            players: 1,
            maxPlayers: 2,
        },
    ]);

    const [playerStats] = useState({
        wins: 42,
        losses: 12,
        rank: "#085 ELITE",
        totalGames: 54,
        winRate: "77.8%",
    });

    const [recentActivity] = useState([
        { time: "14:22", action: "MATCH_WON", opponent: "USER_77", type: "win" },
        { time: "14:05", action: "ENTERED_LOBBY", type: "neutral" },
        { time: "13:58", action: "LEVEL_UP", level: "LVL 14", type: "level" },
        { time: "13:45", action: "MATCH_LOST", opponent: "USER_53", type: "loss" },
    ]);

    // Redirect to landing page if not logged in
    useEffect(() => {
        if (!loading && !isLoggedIn) {
            navigate("/");
        }
    }, [isLoggedIn, loading, navigate]);

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

    const onlineCount = 24;

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
            <main className="flex-grow flex flex-col md:flex-row p-6 gap-6 relative z-10 pt-20">
                {/* Left Sidebar: Player Stats */}
                <aside className="w-full md:w-80 flex flex-col gap-6">
                    {/* Player Stats Card */}
                    <section className="bg-[#1a1a2e] border-2 border-[#2a2a4e] overflow-hidden shadow-[4px_4px_0px_0px_#343342]">
                        <div className="h-1 w-full bg-[#4cc9f0]"></div>
                        <div className="p-6">
                            <h3 className="font-mono text-xs tracking-[0.2em] uppercase text-[#879398] mb-6 flex items-center gap-2">
                                📊 MY STATS
                            </h3>
                            <div className="space-y-5">
                                <div className="flex justify-between items-center border-b border-[#2a2a4e] pb-3">
                                    <span className="text-xs text-[#879398] font-mono uppercase">WINS</span>
                                    <span className="text-2xl font-bold text-[#4cc9f0] drop-shadow-[0_0_8px_#4cc9f0]">
                                        {playerStats.wins}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center border-b border-[#2a2a4e] pb-3">
                                    <span className="text-xs text-[#879398] font-mono uppercase">LOSSES</span>
                                    <span className="text-2xl font-bold text-[#ffb4ab]">{playerStats.losses}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-[#2a2a4e] pb-3">
                                    <span className="text-xs text-[#879398] font-mono uppercase">WIN RATE</span>
                                    <span className="text-lg font-bold text-[#fad100]">{playerStats.winRate}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-[#879398] font-mono uppercase">RANK</span>
                                    <span className="text-lg font-bold text-[#4cc9f0]">{playerStats.rank}</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Recent Activity Card */}
                    <section className="bg-[#1a1a2e] border-2 border-[#2a2a4e] p-6">
                        <h4 className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#879398] mb-4">
                            📜 RECENT ACTIVITY
                        </h4>
                        <div className="space-y-3">
                            {recentActivity.map((activity, idx) => (
                                <div key={idx} className="flex gap-3 text-xs">
                                    <span
                                        className={`font-mono min-w-fit ${
                                            activity.type === "win"
                                                ? "text-[#4cc9f0]"
                                                : activity.type === "loss"
                                                ? "text-[#ffb4ab]"
                                                : activity.type === "level"
                                                ? "text-[#fad100]"
                                                : "text-[#879398]"
                                        }`}
                                    >
                                        [{activity.time}]
                                    </span>
                                    <span className="text-[#e3e0f4] text-opacity-70">
                                        {activity.action}
                                        {activity.opponent && ` vs ${activity.opponent}`}
                                        {activity.level && ` → ${activity.level}`}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </section>
                </aside>

                {/* Main Content Area */}
                <section className="flex-grow flex flex-col gap-8">
                    {/* Header with Controls */}
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                        <div className="flex flex-col gap-3">
                            <h1 className="font-headline text-3xl tracking-tighter text-[#e3e0f4] uppercase">
                                ONLINE ARENA
                            </h1>
                            <div className="flex items-center gap-3">
                                <span className="w-2 h-2 bg-[#4cc9f0] rounded-full animate-pulse"></span>
                                <span className="font-mono text-sm text-[#4cc9f0] tracking-widest uppercase">
                                    {onlineCount} ONLINE
                                </span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 flex-wrap">
                            <button
                                onClick={handleCreateRoom}
                                className="bg-[#4cc9f0] text-[#003543] font-mono font-bold px-6 py-3 shadow-[4px_4px_0px_0px_#003543] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none active:translate-x-1 active:translate-y-1 transition-all uppercase tracking-tighter text-sm flex items-center gap-2"
                            >
                                ➕ CREATE ROOM
                            </button>
                            <button
                                onClick={handleQuickJoin}
                                className="border-2 border-[#2a2a4e] text-[#e3e0f4] font-mono font-bold px-6 py-3 shadow-[4px_4px_0px_0px_#343342] hover:border-[#4cc9f0] hover:text-[#4cc9f0] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none active:translate-x-1 active:translate-y-1 transition-all uppercase tracking-tighter text-sm flex items-center gap-2"
                            >
                                ⚡ QUICK JOIN
                            </button>
                        </div>
                    </div>

                    {/* Room Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max">
                        {rooms.map((room) => (
                            <div
                                key={room.id}
                                className={`bg-[#1a1a2e] border-2 flex flex-col overflow-hidden transition-all ${
                                    room.status === "full"
                                        ? "border-[#2a2a4e] opacity-60 cursor-not-allowed"
                                        : "border-[#2a2a4e] hover:border-[#4cc9f0] hover:shadow-[0_0_12px_#4cc9f0]"
                                }`}
                            >
                                {/* Room Header */}
                                <div className="flex justify-between items-center px-4 py-3 border-b-2 border-[#2a2a4e] bg-[#121225]">
                                    <span className="font-mono text-xs text-[#4cc9f0] font-bold">
                                        ROOM #{room.roomNumber}
                                    </span>
                                    <span className="font-mono text-[10px] text-[#879398] bg-[#0d0d1a] px-2 py-1 border border-[#2a2a4e]">
                                        {room.boardSize}
                                    </span>
                                </div>

                                {/* Room Content */}
                                <div className="p-5 flex-grow flex flex-col gap-4">
                                    {/* Host Info */}
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 border-2 border-[#4cc9f0] flex items-center justify-center bg-[#0d0d1a] text-base">
                                            👾
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-mono text-[10px] text-[#879398] uppercase tracking-wide">
                                                HOST
                                            </span>
                                            <span className="font-mono text-sm font-bold text-[#4cc9f0]">
                                                {room.host}
                                            </span>
                                            <span className="font-mono text-[10px] text-[#fad100]">
                                                {room.hostRank}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Status */}
                                    <div className="flex items-center justify-center py-3 bg-[#0d0d1a] border border-dashed border-[#2a2a4e]">
                                        {room.status === "waiting" && (
                                            <span className="font-mono text-xs text-[#fad100] animate-pulse uppercase tracking-widest">
                                                ⏳ WAITING FOR PLAYER...
                                            </span>
                                        )}
                                        {room.status === "full" && (
                                            <span className="font-mono text-xs text-[#ffb4ab] uppercase tracking-widest">
                                                🔴 MATCH IN PROGRESS
                                            </span>
                                        )}
                                    </div>

                                    {/* Players Count */}
                                    <div className="flex items-center gap-2 text-[10px] text-[#879398] font-mono">
                                        <span>PLAYERS:</span>
                                        <span className="text-[#4cc9f0]">
                                            {room.players}/{room.maxPlayers}
                                        </span>
                                    </div>
                                </div>

                                {/* Join Button */}
                                <div className="p-4 pt-0">
                                    {room.status === "full" ? (
                                        <div className="w-full bg-[#2a2a4e] text-[#879398] py-2 font-mono text-center text-xs uppercase tracking-tighter font-bold cursor-not-allowed">
                                            FULL
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => handleJoinRoom(room.id)}
                                            className="w-full border-2 border-[#4cc9f0] text-[#4cc9f0] py-2 font-mono font-bold hover:bg-[#4cc9f0] hover:text-[#003543] transition-all uppercase tracking-tighter text-sm shadow-[2px_2px_0px_0px_#003543] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none active:translate-x-1 active:translate-y-1"
                                        >
                                            JOIN ROOM
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Empty State */}
                    {rooms.filter((r) => r.status === "waiting").length === 0 && (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                                <p className="font-mono text-[#879398] text-sm mb-4">
                                    NO AVAILABLE ROOMS RIGHT NOW
                                </p>
                                <button
                                    onClick={handleCreateRoom}
                                    className="bg-[#4cc9f0] text-[#003543] font-mono font-bold px-6 py-2 text-sm uppercase tracking-tighter"
                                >
                                    START YOUR OWN ROOM
                                </button>
                            </div>
                        </div>
                    )}
                </section>
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}