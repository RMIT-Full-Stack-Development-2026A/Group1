import React from "react";

export default function GameRoomMonitorHeader({ totalRooms, activeRooms, closedRooms, onRefresh, selectedView, onChangeView }) {
  return (
    <header className="space-y-2">
      <p className="font-mono text-xs uppercase tracking-[0.35em] text-primary">
          Admin Control Deck
      </p>
      <h1 className="font-headline text-3xl uppercase tracking-[0.25em] text-white glow-text-cyan">
          Game Rooms Management
      </h1>
      <p className="max-w-2xl font-mono text-xs uppercase tracking-[0.18em] text-white/55">
        Live-room feed for admin review.
      </p>
      <div className="pt-3">
        <button
          type="button"
          onClick={() => onRefresh && onRefresh()}
          className="inline-flex items-center gap-2 rounded-md border border-cyan-500/25 bg-surface-card px-3 py-2 text-xs font-mono uppercase tracking-[0.18em] text-white/90 hover:brightness-105"
        >
          REFRESH
        </button>
        <div className="inline-block ml-3 align-middle">
          <label className="sr-only">View Mode</label>
          <select
            value={selectedView}
            onChange={(e) => onChangeView && onChangeView(e.target.value)}
            className="ml-3 rounded-md border border-outline px-2 py-1 bg-surface-card text-xs font-mono uppercase tracking-[0.12em] text-white/90"
          >
            <option value="rooms">Game Rooms</option>
            <option value="sessions">Game Sessions</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-3">
        <div className="rounded-lg border border-cyan-500/25 bg-surface-card px-4 py-3 text-primary">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/45">Total</div>
          <div className="mt-1 font-headline text-2xl uppercase tracking-[0.2em]">{totalRooms}</div>
        </div>
        <div className="rounded-lg border border-cyan-500/25 bg-surface-card px-4 py-3 text-primary">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/45">Active</div>
          <div className="mt-1 font-headline text-2xl uppercase tracking-[0.2em]">{activeRooms}</div>
        </div>
        <div className="rounded-lg border border-cyan-500/25 bg-surface-card px-4 py-3 text-primary">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/45">Closed</div>
          <div className="mt-1 font-headline text-2xl uppercase tracking-[0.2em]">{closedRooms}</div>
        </div>
      </div>
    </header>
  );
}
