// Player Profile Page
// Route: /profile
// Orchestrates profile components and manages profile data fetching

import React, { useState } from "react";
import ProfileHeader from "./sub-components/ProfileHeader";
import StatsCard from "./sub-components/StatsCard";
import MatchHistoryTable from "./sub-components/MatchHistoryTable";
import EditProfileModal from "./sub-components/EditProfileModal";
import ChangePasswordModal from "./sub-components/ChangePasswordModal";
import { useProfile } from "./hooks/useProfile";

export default function PlayerProfile() {
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const {
    playerData,
    countryFlag,
    matchHistory,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    filterResult,
    setFilterResult,
    filterGameType,
    setFilterGameType,
    dateFrom,
    handleDateFromChange,
    dateTo,
    handleDateToChange,
    appliedSortBy,
    appliedSortOrder,
    handleSortBy,
    handleApplyFilters,
    handleResetFilters,
    currentPage,
    handlePageChange,
    totalMatches,
    handleEditProfile,
    handleReplay,
    handleAvatarUpdate,
    stats,
    isEditModalOpen,
    setIsEditModalOpen,
    countries,
    countriesLoading,
    isSavingProfile,
    handleSaveProfile,
  } = useProfile();

  // Handle opening change password modal
  const handleOpenChangePassword = () => {
    setIsChangePasswordModalOpen(true);
  };

  // Handle closing change password modal
  const handleCloseChangePassword = () => {
    setIsChangePasswordModalOpen(false);
  };

  // Handle saving new password
  const handleChangePassword = async (passwordData) => {
    try {
      console.log("[Profile] handleChangePassword called");
      setIsChangingPassword(true);
      console.log("[Profile] Calling handleSaveProfile with:", {
        oldPassword: "***",
        newPassword: "***",
        confirmPassword: "***"
      });
      const response = await handleSaveProfile(passwordData);
      console.log("[Profile] handleSaveProfile response:", response);
      return response;
    } catch (error) {
      console.error("[Profile] Error changing password:", error.message);
      // Re-throw so modal can catch and display the error
      throw error;
    } finally {
      setIsChangingPassword(false);
    }
  };

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
    <main className="max-w-[1440px] mx-auto p-8 space-y-8 font-body">
      {/* Profile Header */}
      <ProfileHeader
        playerData={playerData}
        countryFlag={countryFlag}
        onEditProfile={handleEditProfile}
        onChangePassword={handleOpenChangePassword}
        onAvatarUpdate={handleAvatarUpdate}
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
        dateFrom={dateFrom}
        onDateFromChange={handleDateFromChange}
        dateTo={dateTo}
        onDateToChange={handleDateToChange}
        sortBy={appliedSortBy}
        sortOrder={appliedSortOrder}
        onSortBy={handleSortBy}
        currentPage={currentPage}
        totalMatches={totalMatches}
        onPageChange={handlePageChange}
        onReplay={handleReplay}
        onResetFilters={handleResetFilters}
        onApplyFilters={handleApplyFilters}
        loading={loading}
        isPremium={playerData?.isPremium || false}
      />

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        playerData={playerData}
        countries={countries}
        countriesLoading={countriesLoading}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveProfile}
        isSaving={isSavingProfile}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={handleCloseChangePassword}
        onSave={handleChangePassword}
        isSaving={isChangingPassword}
      />
    </main>
  );
}