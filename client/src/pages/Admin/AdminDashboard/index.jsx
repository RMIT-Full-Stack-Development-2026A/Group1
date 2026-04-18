// Admin Dashboard Page
// Route: /admin
// Displays system overview metrics and quick navigation to admin features

import React from "react";
import { useNavigate } from "react-router-dom";
import { useAdminDashboard } from "./hooks/useAdminDashboard";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { metrics, loading, error, formatNumber, getPercentageChange } =
    useAdminDashboard();

  if (error) {
    return (
      <main className="max-w-7xl mx-auto p-8">
        <div className="bg-error-container/20 border border-error-container text-error-container p-6 text-center">
          Error loading dashboard: {error}
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 w-full max-w-7xl mx-auto p-8">
      {/* Dashboard Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="font-mono text-primary text-xs uppercase tracking-[0.3em] mb-1">
            System_Admin_Access
          </p>
          <h2 className="font-headline text-2xl text-white uppercase glow-text-cyan">
            Dashboard_Overview
          </h2>
        </div>
        <div className="flex items-center gap-3 font-mono text-[10px] text-on-surface-variant bg-[#1a1a2e] border border-[#2a2a4e] px-4 py-2">
          <span className="w-2 h-2 bg-primary animate-pulse"></span>
          {loading ? "INITIALIZING..." : "LIVE_FEED_ACTIVE"} // NODE_01
        </div>
      </div>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {/* Total Players */}
        <div className="bg-[#1a1a2e] border-circuit p-6 relative group hover:border-[#4cc9f0] transition-colors">
          <div className="flex justify-between items-start mb-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant font-mono">
              Total Players
            </p>
            <span
              className="material-symbols-outlined text-primary text-lg"
              data-icon="groups"
            >
              groups
            </span>
          </div>
          <p className="text-3xl font-headline text-primary glow-text-cyan">
            {loading ? "..." : formatNumber(metrics?.totalPlayers || 0)}
          </p>
          <p className="text-[9px] mt-2 text-on-surface-variant uppercase font-mono">
            {loading ? "Loading..." : getPercentageChange(metrics?.totalPlayers)}
            vs last cycle
          </p>
        </div>

        {/* Active Players */}
        <div className="bg-[#1a1a2e] border-circuit p-6 relative border-l-4 border-l-[#4cc9f0] glow-cyan">
          <div className="flex justify-between items-start mb-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary font-mono">
              Active Players
            </p>
            <span
              className="material-symbols-outlined text-primary text-lg"
              data-icon="bolt"
            >
              bolt
            </span>
          </div>
          <p className="text-3xl font-headline text-primary glow-text-cyan">
            {loading ? "..." : metrics?.activePlayers || 0}
          </p>
          <p className="text-[9px] mt-2 text-primary uppercase font-mono">
            Current_Live_Sessions
          </p>
        </div>

        {/* Premium Players */}
        <div className="bg-[#1a1a2e] border-circuit p-6 relative">
          <div className="flex justify-between items-start mb-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-secondary-container font-mono">
              Premium Players
            </p>
            <span
              className="material-symbols-outlined text-secondary-container text-lg"
              data-icon="workspace_premium"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              workspace_premium
            </span>
          </div>
          <p className="text-3xl font-headline text-secondary-container">
            {loading ? "..." : metrics?.premiumPlayers || 0}
          </p>
          <p className="text-[9px] mt-2 text-on-surface-variant uppercase font-mono">
            {loading
              ? "Calculating..."
              : metrics?.totalPlayers > 0
              ? (
                  ((metrics?.premiumPlayers || 0) / metrics?.totalPlayers) *
                  100
                ).toFixed(1) + "% conversion"
              : "No data"}
          </p>
        </div>

        {/* Active Rooms */}
        <div className="bg-[#1a1a2e] border-circuit p-6 relative">
          <div className="flex justify-between items-start mb-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-tertiary-container font-mono">
              Active Rooms
            </p>
            <span
              className="material-symbols-outlined text-tertiary-container text-lg"
              data-icon="meeting_room"
            >
              meeting_room
            </span>
          </div>
          <p className="text-3xl font-headline text-tertiary-container">
            {loading ? "..." : metrics?.activeRooms || 0}
          </p>
          <p className="text-[9px] mt-2 text-on-surface-variant uppercase font-mono">
            Avg_latency: 14ms
          </p>
        </div>

        {/* Total Matches */}
        <div className="bg-[#1a1a2e] border-circuit p-6 relative">
          <div className="flex justify-between items-start mb-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant font-mono">
              Total Matches
            </p>
            <span
              className="material-symbols-outlined text-[#4cc9f0] text-lg"
              data-icon="videogame_asset"
            >
              videogame_asset
            </span>
          </div>
          <p className="text-3xl font-headline text-white">
            {loading ? "..." : formatNumber(metrics?.totalMatches || 0)}
          </p>
          <p className="text-[9px] mt-2 text-on-surface-variant uppercase font-mono">
            Historical_Record
          </p>
        </div>

        {/* Total Revenue */}
        <div className="bg-[#1a1a2e] border-circuit p-6 relative">
          <div className="flex justify-between items-start mb-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-secondary-container font-mono">
              Total Revenue
            </p>
            <span
              className="material-symbols-outlined text-secondary-container text-lg"
              data-icon="monetization_on"
            >
              monetization_on
            </span>
          </div>
          <p className="text-3xl font-headline text-secondary-container">
            {loading ? "..." : formatNumber(metrics?.totalRevenue || 0)}
          </p>
          <p className="text-[9px] mt-2 text-on-surface-variant uppercase font-mono">
            Credits_Accumulated
          </p>
        </div>
      </section>

      {/* New Players Stats & Navigation */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* New Registration Stats */}
        <div className="bg-[#1a1a2e] border-circuit p-6">
          <h3 className="font-headline text-xs text-primary uppercase mb-6 flex items-center gap-2">
            <span
              className="material-symbols-outlined text-sm"
              data-icon="person_add"
            >
              person_add
            </span>
            New_Registration_Stats
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-[#2a2a4e] pb-3">
              <span className="font-mono text-[10px] uppercase text-on-surface-variant">
                Today
              </span>
              <span className="font-headline text-sm text-[#4cc9f0]">
                {loading ? "..." : "+" + (metrics?.newPlayersToday || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-[#2a2a4e] pb-3">
              <span className="font-mono text-[10px] uppercase text-on-surface-variant">
                This Week
              </span>
              <span className="font-headline text-sm text-[#4cc9f0]">
                {loading ? "..." : "+" + (metrics?.newPlayersThisWeek || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center pb-1">
              <span className="font-mono text-[10px] uppercase text-on-surface-variant">
                This Month
              </span>
              <span className="font-headline text-sm text-[#4cc9f0]">
                {loading ? "..." : "+" + (metrics?.newPlayersThisMonth || 0)}
              </span>
            </div>
          </div>
          <div className="mt-6 h-1 w-full bg-[#2a2a4e] overflow-hidden">
            <div
              className="h-full bg-[#4cc9f0] animate-[pulse_2s_infinite]"
              style={{
                width: loading ? "50%" : "66%",
              }}
            ></div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-col gap-4">
          {/* Player Management Link */}
          <button
            onClick={() => navigate("/admin/players")}
            className="flex-1 bg-[#1a1a2e] border-2 border-[#4cc9f0] p-6 flex items-center justify-between group arcade-button-shadow hover:bg-[#1e1e3e] transition-all"
          >
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="font-headline text-xs text-[#4cc9f0]">
                  PLAYER MANAGEMENT
                </span>
                <span className="font-mono text-[9px] text-on-surface-variant">
                  /admin/players
                </span>
              </div>
              <p className="font-mono text-[10px] text-on-surface-variant">
                View and manage all player accounts
              </p>
            </div>
            <span
              className="material-symbols-outlined text-2xl text-[#4cc9f0] group-hover:translate-x-1 transition-transform"
              data-icon="chevron_right"
            >
              chevron_right
            </span>
          </button>

          {/* Game Room Monitor Link */}
          <button
            onClick={() => navigate("/admin/rooms")}
            className="flex-1 bg-[#1a1a2e] border-2 border-[#4cc9f0] p-6 flex items-center justify-between group arcade-button-shadow hover:bg-[#1e1e3e] transition-all"
          >
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="font-headline text-xs text-[#4cc9f0]">
                  GAME ROOM MONITOR
                </span>
                <span className="font-mono text-[9px] text-on-surface-variant">
                  /admin/rooms
                </span>
              </div>
              <p className="font-mono text-[10px] text-on-surface-variant">
                Monitor and control online game rooms
              </p>
            </div>
            <span
              className="material-symbols-outlined text-2xl text-[#4cc9f0] group-hover:translate-x-1 transition-transform"
              data-icon="chevron_right"
            >
              chevron_right
            </span>
          </button>
        </div>
      </section>
    </main>
  );
}