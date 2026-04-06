import React from "react";

export default function LobbyHeader({ onlineCount, onCreateRoom, onQuickJoin }) {
    return (
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
                    onClick={onCreateRoom}
                    className="bg-[#4cc9f0] text-[#003543] font-mono font-bold px-6 py-3 shadow-[4px_4px_0px_0px_#003543] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none active:translate-x-1 active:translate-y-1 transition-all uppercase tracking-tighter text-sm flex items-center gap-2"
                >
                    ➕ CREATE ROOM
                </button>
                <button
                    onClick={onQuickJoin}
                    className="border-2 border-[#2a2a4e] text-[#e3e0f4] font-mono font-bold px-6 py-3 shadow-[4px_4px_0px_0px_#343342] hover:border-[#4cc9f0] hover:text-[#4cc9f0] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none active:translate-x-1 active:translate-y-1 transition-all uppercase tracking-tighter text-sm flex items-center gap-2"
                >
                    ⚡ QUICK JOIN
                </button>
            </div>
        </div>
    );
}
