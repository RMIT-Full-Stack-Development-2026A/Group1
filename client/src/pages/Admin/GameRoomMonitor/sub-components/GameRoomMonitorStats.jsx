import React from "react";

const StatCard = ({ label, value, tone = "text-primary" }) => (
  <div className="border border-outline-variant bg-[#1b1c2c] p-4">
    <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-outline">{label}</p>
    <p className={`mt-2 font-arcade text-3xl ${tone}`}>{value}</p>
  </div>
);

export default function GameRoomMonitorStats({ activeRooms, waitingRooms, inProgressRooms, closedRooms }) {
  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
      <StatCard label="Active rooms" value={activeRooms} />
      <StatCard label="Waiting rooms" value={waitingRooms} tone="text-[#ffd60a]" />
      <StatCard label="In progress" value={inProgressRooms} tone="text-[#ffb4ab]" />
      <StatCard label="Closed rooms" value={closedRooms} tone="text-white/70" />
    </section>
  );
}
