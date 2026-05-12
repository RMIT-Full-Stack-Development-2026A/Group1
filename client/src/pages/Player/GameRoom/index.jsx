import React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

export default function GameRoom() {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const room = location.state?.room;

    return (
        <main className="min-h-screen bg-deep-bg px-6 py-10 text-on-surface">
            <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 border border-outline-variant bg-surface-card p-8 shadow-[6px_6px_0px_0px_#1e1e2c]">
                <div className="flex flex-col gap-2">
                    <span className="font-mono text-xs uppercase tracking-widest text-primary-cyan">ROOM LOBBY</span>
                    <h1 className="font-headline text-2xl uppercase text-[#e3e0f4]">Game Room</h1>
                </div>

                <div className="grid gap-4 rounded border border-dashed border-outline-variant bg-deep-bg p-4 font-mono text-sm text-outline md:grid-cols-2">
                    <div>
                        <div className="text-[10px] uppercase tracking-widest text-primary-cyan">Room ID</div>
                        <div className="break-all text-[#e3e0f4]">{roomId}</div>
                    </div>
                    <div>
                        <div className="text-[10px] uppercase tracking-widest text-primary-cyan">Status</div>
                        <div className="text-[#e3e0f4]">{room?.status || 'waiting'}</div>
                    </div>
                    <div>
                        <div className="text-[10px] uppercase tracking-widest text-primary-cyan">Room Number</div>
                        <div className="text-[#e3e0f4]">{room?.roomNumber || 'TBD'}</div>
                    </div>
                    <div>
                        <div className="text-[10px] uppercase tracking-widest text-primary-cyan">Board Size</div>
                        <div className="text-[#e3e0f4]">{room?.boardSize || '10x10'}</div>
                    </div>
                </div>

                <div className="flex flex-col gap-3 md:flex-row">
                    <button
                        type="button"
                        onClick={() => navigate('/lobby')}
                        className="border border-primary-cyan px-4 py-3 font-mono text-xs uppercase tracking-widest text-primary-cyan transition-colors hover:bg-primary-cyan hover:text-[#003543]"
                    >
                        Back to Lobby
                    </button>
                </div>

                <p className="font-mono text-xs uppercase tracking-widest text-[#879398]">
                    This room page is a placeholder for the separate live-room implementation.
                </p>
            </div>
        </main>
    );
}