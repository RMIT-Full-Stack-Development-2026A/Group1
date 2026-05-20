// Admin Dashboard Page
// Route: /admin
// Displays system overview metrics and quick navigation to admin features

import React from "react";
import { useNavigate } from "react-router-dom";
import { useAdminDashboard } from "./hooks/useAdminDashboard";
import MetricCard from "./sub-components/MetricCard";
import RegistrationBarChart from "./sub-components/RegistrationBarChart";
import RegistrationLineChart from "./sub-components/RegistrationLineChart";
import ActionButton from "./sub-components/ActionButton";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { metrics, loading, error, formatNumber } =
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
          value={metrics?.totalPlayers || 0}
          icon="groups"
          colorScheme="blue"
          footer="Total players count"
          loading={loading}
        />

        <MetricCard
          title={
            <>
              ACTIVE<span className="text-[#ff5c5c]">/DEACTIVATED</span> PLAYERS
            </>
          }
          value={metrics?.activePlayers || 0}
          icon="bolt"
          colorScheme="skin"
          secondaryValue={metrics?.deactivatedPlayers || 0}
          secondaryColorScheme="red"
          inlineSecondary={true}
          footer={
            <>
              Current Active<span className="text-[#ff5c5c]">/Inactive</span> Players
            </>
          }
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
          value={metrics?.totalMatches || 0}
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

      {/* Registration Charts */}
      <section className="mb-12 bg-surface-card border border-cyan-500/30 rounded-lg p-6 glow-container">
        <h3 className="font-headline text-primary text-xs uppercase tracking-[0.3em] mb-6">
          Registration Analytics
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {/* Today - Line Chart */}
          <RegistrationLineChart
            data={metrics?.registrationsByHour || []}
            title="REGISTERED TODAY"
            xAxisTitle="Hour (UTC+7)"
            xAxisKey="hour"
            xAxisLabels={Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"))}
            tooltipLabelPrefix="Hour"
            showPanel={false}
          />

          {/* This Week - Bar Chart */}
          <RegistrationBarChart
            data={metrics?.registrationsByDay || []}
            title="REGISTERED THIS WEEK"
            xAxisTitle="Weekday"
            labels={["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]}
            showPanel={false}
          />

          {/* This Month - Line Chart */}
          <RegistrationLineChart
            data={metrics?.registrationsByMonth || []}
            title="REGISTERED THIS MONTH"
            xAxisTitle="Day"
            xAxisKey="day"
            xAxisLabels={Array.from({ length: 30 }, (_, i) => String(i).padStart(2, "0"))}
            tooltipLabelPrefix="Day"
            showPanel={false}
          />
        </div>
      </section>

      {/* Navigation Links */}
      <section className="flex flex-col md:flex-row gap-6">
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
      </section>
    </main>
  );
}