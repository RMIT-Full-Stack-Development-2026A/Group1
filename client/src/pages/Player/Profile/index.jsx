// Player Profile Page
// Route: /profile
// Orchestrates profile components and manages profile data fetching

import React from "react";
import ProfileHeader from "./sub-components/ProfileHeader";
import StatsCard from "./sub-components/StatsCard";
import MatchHistoryTable from "./sub-components/MatchHistoryTable";
import { useProfile } from "./hooks/useProfile";

export default function PlayerProfile() {
  const {
    playerData,
    matchHistory,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    filterResult,
    setFilterResult,
    filterGameType,
    setFilterGameType,
    currentPage,
    handlePageChange,
    totalMatches,
    handleEditProfile,
    handleReplay,
    stats,
  } = useProfile();

  if (error) {
    return (
      <main className="max-w-[1440px] mx-auto p-8">
        <div className="bg-error-container/20 border border-error-container text-error-container p-6 text-center">
          Error loading profile: {error}
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-[1440px] mx-auto p-8 space-y-8">
      {/* Profile Header */}
      <ProfileHeader
        playerData={playerData}
        onEditProfile={handleEditProfile}
      />

      {/* Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatsCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            barWidth={stat.barWidth}
            color={stat.color}
          />
        ))}
      </section>

      {/* Match History Table */}
      <MatchHistoryTable
        matches={matchHistory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterResult={filterResult}
        onFilterResultChange={setFilterResult}
        filterGameType={filterGameType}
        onFilterGameTypeChange={setFilterGameType}
        currentPage={currentPage}
        totalMatches={totalMatches}
        onPageChange={handlePageChange}
        onReplay={handleReplay}
        loading={loading}
      />
    </main>
  );
}