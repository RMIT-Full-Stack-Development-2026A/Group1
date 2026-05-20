import React from "react";

export default function GameRoomMonitorFilters({ searchTerm, setSearchTerm, onResetSearch, onRefresh, loading }) {
  return (
    <section className="border border-outline-variant bg-[#1b1c2c] p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <label className="flex-1 space-y-2">
          <span className="block font-mono text-[10px] uppercase tracking-[0.32em] text-outline">
            Search sessions
          </span>
          <div className="flex items-center gap-3 border-b-2 border-outline bg-surface-container-highest px-4 py-2">
            <span className="material-symbols-outlined text-primary-cyan text-[20px]">search</span>
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Room number or player name"
              className="w-full bg-transparent font-body text-xs uppercase tracking-[0.14em] text-on-surface outline-none placeholder:text-outline-variant"
            />
          </div>
        </label>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onResetSearch}
            disabled={loading || searchTerm.length === 0}
            className="border border-outline px-4 py-3 font-mono text-xs uppercase tracking-[0.22em] text-on-surface transition-colors hover:bg-outline hover:text-on-secondary disabled:cursor-not-allowed disabled:opacity-40"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="border border-cyan-500/25 bg-surface-card px-4 py-3 font-mono text-xs uppercase tracking-[0.22em] text-on-surface transition-colors hover:bg-cyan-500/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Refresh
          </button>
        </div>
      </div>
    </section>
  );
}
