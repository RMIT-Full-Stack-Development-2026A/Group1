import React from "react";
import GameRoomCard from "./GameRoomCard";

export default function GameRoomGrid({ rooms, onCloseRoom, closingRoomId, loading }) {
  if (loading) {
    return (
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="h-72 animate-pulse rounded-lg border border-cyan-500/20 bg-surface-card/70" />
        <div className="h-72 animate-pulse rounded-lg border border-cyan-500/20 bg-surface-card/70" />
      </section>
    );
  }

  if (!rooms.length) {
    return (
      <section className="rounded-lg border border-dashed border-cyan-500/25 bg-surface-card/80 p-10 text-center">
        <p className="font-mono text-sm uppercase tracking-[0.2em] text-white/50">
          No rooms match the current search.
        </p>
      </section>
    );
  }

  return (
    <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      {rooms.map((room) => (
        <GameRoomCard key={room.id} room={room} onClose={onCloseRoom} closingRoomId={closingRoomId} />
      ))}
    </section>
  );
}
