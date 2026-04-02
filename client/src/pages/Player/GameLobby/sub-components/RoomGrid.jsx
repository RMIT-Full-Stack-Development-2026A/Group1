import React from "react";
import RoomCard from "./RoomCard";

export default function RoomGrid({ rooms, onJoinRoom, onCreateRoom }) {
    const hasAvailableRooms = rooms.some((r) => r.status === "waiting");

    return (
        <>
            {/* Room Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max">
                {rooms.map((room) => (
                    <RoomCard key={room.id} room={room} onJoin={onJoinRoom} />
                ))}
            </div>

            {/* Empty State */}
            {!hasAvailableRooms && (
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <p className="font-mono text-[#879398] text-sm mb-4">
                            NO AVAILABLE ROOMS RIGHT NOW
                        </p>
                        <button
                            onClick={onCreateRoom}
                            className="bg-[#4cc9f0] text-[#003543] font-mono font-bold px-6 py-2 text-sm uppercase tracking-tighter"
                        >
                            START YOUR OWN ROOM
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
