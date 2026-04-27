// Admin Dashboard Page
// Route: /admin
// Displays system overview metrics and quick navigation to admin features

import React from "react";
import { useNavigate } from "react-router-dom";
import { useAdminDashboard } from "./hooks/useAdminDashboard";
import MetricCard from "./components/MetricCard";
import RegistrationStats from "./components/RegistrationStats";
import ActionButton from "./components/ActionButton";

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
            System Admin Access
          </p>
          <h2 className="font-headline text-2xl text-white uppercase glow-text-cyan">
            Dashboard Overview
          </h2>
        </div>
      </div>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <MetricCard
          title="Total Players"
          value={formatNumber(metrics?.totalPlayers || 0)}
          icon="groups"
          colorScheme="blue"
          footer={loading ? "Loading..." : `${getPercentageChange(metrics?.totalPlayers)} vs last cycle`}
          loading={loading}
        />

        <MetricCard
          title="Active Players"
          value={metrics?.activePlayers || 0}
          icon="bolt"
          colorScheme="skin"
          footer="Current Live Sessions"
          loading={loading}
        />

        <MetricCard
          title="Premium Players"
          value={metrics?.premiumPlayers || 0}
          icon="workspace_premium"
          colorScheme="yellow"
          isPremium={true}
          footer={
            loading
              ? "Calculating..."
              : metrics?.totalPlayers > 0
              ? (
                  ((metrics?.premiumPlayers || 0) / metrics?.totalPlayers) *
                  100
                ).toFixed(1) + "% conversion"
              : "No data"
          }
          loading={loading}
        />

        <MetricCard
          title="Active Rooms"
          value={metrics?.activeRooms || 0}
          icon="meeting_room"
          colorScheme="blue"
          footer="Rooms currently playing"
          loading={loading}
        />

        <MetricCard
          title="Total Matches"
          value={formatNumber(metrics?.totalMatches || 0)}
          icon="videogame_asset"
          colorScheme="skin"
          footer="Historical Record"
          loading={loading}
        />

        <MetricCard
          title="Total Revenue"
          value={`$${formatNumber(metrics?.totalRevenue || 0)}`}
          icon="monetization_on"
          colorScheme="yellow"
          footer={loading ? "Calculating..." : `Monthly: $${formatNumber(metrics?.revenueThisMonth || 0)}`}
          loading={loading}
        />
      </section>

      {/* New Players Stats & Navigation */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <RegistrationStats metrics={metrics} loading={loading} />

        {/* Navigation Links */}
        <div className="flex flex-col gap-4">
          <ActionButton
            label="PLAYER MANAGEMENT"
            path="/admin/players"
            description="View and manage all player accounts"
            icon="groups"
            onClick={() => navigate("/admin/players")}
          />

          <ActionButton
            label="GAME ROOM MONITOR"
            path="/admin/rooms"
            description="Monitor and control online game rooms"
            icon="meeting_room"
            onClick={() => navigate("/admin/rooms")}
          />
        </div>
      </section>
    </main>
  );
}