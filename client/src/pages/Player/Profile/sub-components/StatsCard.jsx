// Stats Card Sub-component - Reusable card for displaying individual statistics
import React from "react";

export default function StatsCard({ label, value, icon, barWidth, color }) {
  const getProgressBar = () => {
    if (label === "WIN RATE" && typeof barWidth === "object") {
      // Special case for win rate with segmented bar
      return (
        <div className="mt-2 h-1 bg-surface-container-highest w-full flex gap-1">
          <div className="h-full bg-tertiary-container flex-grow"></div>
          <div className="h-full bg-tertiary-container flex-grow"></div>
          <div className="h-full bg-tertiary-container flex-grow"></div>
          <div className="h-full bg-surface-container-highest flex-grow"></div>
        </div>
      );
    }

    return (
      <div className="mt-2 h-1 bg-surface-container-highest w-full">
        <div className={`h-full ${color} w-[${barWidth}%]`} style={{ width: `${barWidth}%` }}></div>
      </div>
    );
  };

  return (
    <div className="bg-surface-container border border-outline-variant p-4 relative overflow-hidden group">
      <div className={`absolute top-0 left-0 w-full h-[4px] ${color}`}></div>

      <div className="flex justify-between items-start mb-4">
        <p className="text-[10px] font-bold text-outline uppercase tracking-widest">
          {label}
        </p>
        <span className={`material-symbols-outlined ${color} opacity-50`}>
          {icon}
        </span>
      </div>

      <p className={`font-arcade text-3xl ${color}`}>
        {value}
      </p>

      {getProgressBar()}
    </div>
  );
}
