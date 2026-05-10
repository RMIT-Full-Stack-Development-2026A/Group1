import React from "react";

export default function RoomCard({ room, onJoin }) {
    const isFull = room.status === "full";

    return (
        <div
            className={`bg-[#1a1a2e] border-2 flex flex-col overflow-hidden transition-all ${
                isFull
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
            <div className="p-5 grow flex flex-col gap-4">
                {/* Host vs Opponent */}
                <div className="flex items-center justify-between w-full">
                    {/* Host */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 border-2 border-[#4cc9f0] flex items-center justify-center bg-[#0d0d1a]">
                            <span className="material-symbols-outlined text-[#4cc9f0]">person</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="font-mono text-[10px] text-[#879398] uppercase tracking-wide">{room.host}</span>
                            <span className="font-mono text-[10px] text-[#fad100]">{room.hostRank}</span>
                        </div>
                    </div>

                    {/* VS */}
                    <div className="text-center">
                        <span className="font-mono text-sm text-[#4cc9f0] font-bold">VS</span>
                    </div>

                    {/* Opponent */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 border-2 border-[#4cc9f0] flex items-center justify-center bg-[#0d0d1a]">
                            <span className="material-symbols-outlined text-[#4cc9f0]">person</span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="font-mono text-[10px] text-[#4cc9f0] font-bold uppercase tracking-wide">{room.opponent || 'WAITING'}</span>
                            <span className="font-mono text-[10px] text-[#fad100]">{room.opponentRank}</span>
                        </div>
                    </div>
                </div>

                {/* Status */}
                <div className="flex items-center justify-center py-3 bg-[#0d0d1a] border border-dashed border-[#2a2a4e]">
                    {room.status === "waiting" && (
                        <span className="font-mono text-xs text-[#fad100] animate-pulse uppercase tracking-widest flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">hourglass_empty</span>
                            WAITING FOR PLAYER...
                        </span>
                    )}
                    {room.status === "full" && (
                        <span className="font-mono text-xs text-[#ffb4ab] uppercase tracking-widest flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">fiber_manual_record</span>
                            MATCH IN PROGRESS
                        </span>
                    )}
                </div>

            </div>

            {/* Join Button */}
            <div className="p-4 pt-0">
                {isFull ? (
                    <div className="w-full bg-[#2a2a4e] text-[#879398] py-2 font-mono text-center text-xs uppercase tracking-tighter font-bold cursor-not-allowed">
                        FULL
                    </div>
                ) : (
                    <button
                        onClick={() => onJoin(room.id)}
                        className="w-full border-2 border-[#4cc9f0] text-[#4cc9f0] py-2 font-mono font-bold hover:bg-[#4cc9f0] hover:text-[#003543] transition-all uppercase tracking-tighter text-sm shadow-[2px_2px_0px_0px_#003543] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none active:translate-x-1 active:translate-y-1"
                    >
                        JOIN ROOM
                    </button>
                )}
            </div>
        </div>
    );
}
