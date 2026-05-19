import React from "react";

export default function GameSessionMonitorFilters({ initialFilters = {}, onApply, onRefresh, loading }) {
  const [local, setLocal] = React.useState({ ...initialFilters });

  const updateLocal = (key, value) => {
    const updated = { ...local, [key]: value };
    setLocal(updated);
    if (typeof onApply === "function") {
      onApply(updated);
    }
  };

  const handleReset = () => {
    setLocal({});
    if (typeof onApply === "function") {
      onApply({});
    }
  };

  return (
    <section className="border border-outline-variant bg-[#1b1c2c] p-6">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,0.75fr)_minmax(0,0.75fr)]">
        <label className="space-y-2 min-w-0">
          <span className="block font-mono text-[10px] uppercase tracking-[0.32em] text-outline">Session #</span>
          <input
            type="text"
            value={local.sessionNumber || ""}
            onChange={(e) => updateLocal("sessionNumber", e.target.value)}
            placeholder="Session number"
            className="w-full bg-transparent font-body text-xs uppercase tracking-[0.14em] text-on-surface outline-none placeholder:text-outline-variant border-b-2 border-outline px-3 py-2"
          />
        </label>

        <label className="space-y-2 min-w-0">
          <span className="block font-mono text-[10px] uppercase tracking-[0.32em] text-outline">Player name</span>
          <input
            type="text"
            value={local.q || ""}
            onChange={(e) => updateLocal("q", e.target.value)}
            placeholder="Player username"
            className="w-full bg-transparent font-body text-xs uppercase tracking-[0.14em] text-on-surface outline-none placeholder:text-outline-variant border-b-2 border-outline px-3 py-2"
          />
        </label>

      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto_auto] md:items-end">
        <label className="space-y-1 min-w-0">
          <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-outline">From</span>
          <input type="date" value={local.from || ""} onChange={(e) => updateLocal("from", e.target.value)} className="w-full bg-transparent border-b-2 border-outline px-3 py-2" />
        </label>

        <label className="space-y-1 min-w-0">
          <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-outline">To</span>
          <input type="date" value={local.to || ""} onChange={(e) => updateLocal("to", e.target.value)} className="w-full bg-transparent border-b-2 border-outline px-3 py-2" />
        </label>

        <label className="space-y-1 min-w-0">
          <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-outline">Status</span>
          <select value={local.status || ""} onChange={(e) => updateLocal("status", e.target.value || undefined)} className="w-full bg-transparent border-b-2 border-outline px-3 py-2">
            <option value="">Any</option>
            <option value="FINISHED">Finished</option>
            <option value="DRAW">Draw</option>
            <option value="ABORTED">Aborted</option>
          </select>
        </label>

        <button
          type="button"
          onClick={handleReset}
          disabled={loading}
          className="whitespace-nowrap border border-outline px-3 py-2 font-mono text-xs uppercase tracking-[0.22em] text-on-surface transition-colors hover:bg-outline hover:text-on-secondary disabled:cursor-not-allowed disabled:opacity-40 md:justify-self-end"
        >
          Reset
        </button>

        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="whitespace-nowrap border border-cyan-500/25 bg-surface-card px-3 py-2 font-mono text-xs uppercase tracking-[0.22em] text-on-surface transition-colors hover:bg-cyan-500/10 disabled:cursor-not-allowed disabled:opacity-40 md:justify-self-end"
        >
          Refresh
        </button>
      </div>
    </section>
  );
}
