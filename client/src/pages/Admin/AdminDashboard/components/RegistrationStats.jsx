import React from "react";

export default function RegistrationStats({ metrics, loading }) {
  const stats = [
    { label: "Today", value: metrics?.newPlayersToday || 0 },
    { label: "This Week", value: metrics?.newPlayersThisWeek || 0 },
    { label: "This Month", value: metrics?.newPlayersThisMonth || 0 }
  ];

  return (
    <div className="bg-[#1a1a2e] border-circuit p-6">
      <h3 className="font-headline text-primary-cyan text-primary uppercase mb-6 flex items-center gap-2">
        <span
          className="material-symbols-outlined text-sm"
          data-icon="person_add"
        >
          person_add
        </span>
        New Registration Stats
      </h3>
      <div className="space-y-4">
        {stats.map((stat) => (
          <div key={stat.label} className="flex justify-between items-center border-b border-[#2a2a4e] pb-3">
            <span className="font-mono text-[10px] uppercase text-on-surface-variant">
              {stat.label}
            </span>
            <span className="font-headline text-sm text-[#4cc9f0]">
              {loading ? "..." : `+${stat.value}`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
