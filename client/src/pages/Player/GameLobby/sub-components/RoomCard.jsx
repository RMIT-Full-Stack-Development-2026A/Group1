import React from "react";

export default function RoomCard({ room, onJoin, currentUserId }) {
    const normalizedStatus = String(room.status || "waiting").toLowerCase();
    const isJoinable = normalizedStatus === "waiting";
    const isReady = normalizedStatus === "ready";
    const isPlaying = normalizedStatus === "playing";
    const isMyPlayingRoom = isPlaying &&
        Array.isArray(room.participantIds) &&
        room.participantIds.includes(String(currentUserId));

    return (
        <div
            className={`bg-surface-card border-2 flex flex-col overflow-hidden transition-all ${
                isJoinable
                    ? "border-outline-variant hover:border-primary-cyan hover:shadow-[0_0_12px_#4cc9f0]"
                    : isReady
                        ? "border-[#fad100] opacity-95"
                        : isPlaying
                            ? "border-error opacity-75"
                            : "border-outline-variant opacity-60"
            }`}
        >
            <div className="flex justify-between items-center px-4 py-3 border-b-2 border-outline-variant bg-deep-bg">
                <span className="font-mono text-xs text-primary-cyan font-bold">ROOM #{room.roomNumber}</span>
                <span className="font-mono text-[10px] text-outline bg-deep-bg px-2 py-1 border border-outline-variant">{room.boardSize}</span>
            </div>

            {/* Room Content */}
            <div className="p-5 grow flex flex-col gap-4">
                {/* Host vs Opponent */}
                <div className="flex items-center justify-between w-full">
                    {/* Host */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 border-2 border-primary-cyan flex items-center justify-center bg-deep-bg">
                            <span className="material-symbols-outlined text-primary-cyan">person</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="font-mono text-[10px] text-outline uppercase tracking-wide">{room.host}</span>
                            <span className="font-mono text-[10px] text-[#fad100]">{room.hostRank}</span>
                        </div>
                    </div>

                    {/* VS */}
                    <div className="text-center">
                        <span className="font-mono text-sm text-primary-cyan font-bold">VS</span>
                    </div>

                    {/* Opponent */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 border-2 border-primary-cyan flex items-center justify-center bg-deep-bg">
                            <span className="material-symbols-outlined text-primary-cyan">person</span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="font-mono text-[10px] text-primary-cyan font-bold uppercase tracking-wide">{room.opponent || 'WAITING'}</span>
                            <span className="font-mono text-[10px] text-[#fad100]">{room.opponentRank}</span>
                        </div>
                    </div>
                </div>

                {/* Status */}
                <div className="flex items-center justify-center py-3 bg-deep-bg border border-dashed border-outline-variant">
                    {normalizedStatus === "waiting" && (
                        <span className="font-mono text-xs text-[#fad100] animate-pulse uppercase tracking-widest flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">hourglass_empty</span>
                            WAITING FOR PLAYER...
                        </span>
                    )}
                    {normalizedStatus === "ready" && (
                        <span className="font-mono text-xs text-primary-cyan uppercase tracking-widest flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">check_circle</span>
                            READY TO START
                        </span>
                    )}
                    {normalizedStatus === "playing" && (
                        <span className="font-mono text-xs text-error uppercase tracking-widest flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">fiber_manual_record</span>
                            MATCH IN PROGRESS
                        </span>
                    )}
                </div>
            </div>

            {/* Join Button */}
            <div className="p-4 pt-0">
                {isJoinable ? (
                    <button
                        onClick={() => onJoin(room.id)}
                        className="w-full border-2 border-primary-cyan text-primary-cyan py-2 font-mono font-bold hover:bg-primary-cyan hover:text-[#003543] transition-all uppercase tracking-tighter text-sm shadow-[2px_2px_0px_0px_#003543] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none active:translate-x-1 active:translate-y-1"
                    >
                        JOIN ROOM
                    </button>
                ) : isMyPlayingRoom ? (
                    <button
                        onClick={() => onJoin(room.id)}
                        className="w-full border-2 border-[#fad100] text-[#fad100] py-2 font-mono font-bold hover:bg-[#fad100]/10 transition-all uppercase tracking-tighter text-sm shadow-[2px_2px_0px_0px_#3b2f00] animate-pulse cursor-pointer"
                    >
                        ↩ REJOIN MATCH
                    </button>
                ) : (
                    <div className={`w-full py-2 font-mono text-center text-xs uppercase tracking-tighter font-bold cursor-not-allowed ${
                        isReady ? 'bg-[#2f2a00] text-[#fad100]' : 'bg-surface-container-low text-outline'
                    }`}>
                        {isReady ? 'READY' : 'IN PROGRESS'}
                    </div>
                )}
            </div>
        </div>
    );
}
