import React from "react";
import RoomCard from "./RoomCard";

export default function RoomGrid({ rooms, onJoinRoom, onCreateRoom }) {
    // Ensure rooms is always an array
    const roomList = Array.isArray(rooms) ? rooms : [];

    return (
        <div className="flex flex-col w-full h-full">
            {/* Room Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max">
                {roomList.map((room) => (
                    <RoomCard key={room.id} room={room} onJoin={onJoinRoom} />
                ))}
            </div>

            {/* Empty State - Centered */}
            {roomList.length === 0 && (
                <div className="flex-grow flex items-center justify-center pt-64">
                    <div className="text-center">
                        <p className="font-mono text-[#879398] text-sm">
                            NO AVAILABLE ROOMS RIGHT NOW
                        </p>
                        <button
                            onClick={onCreateRoom}
                            className="bg-[#4cc9f0] text-[#003543] font-mono cursor-pointer font-bold px-6 py-2 text-sm uppercase tracking-tighter"
                        >
                            START YOUR OWN ROOM
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
