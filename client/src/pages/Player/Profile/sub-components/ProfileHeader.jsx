// Profile Header Sub-component - Displays player avatar, username, and basic info
import React from "react";

export default function ProfileHeader({ playerData, onEditProfile }) {
  if (!playerData) {
    return <div className="h-32 bg-surface-container animate-pulse"></div>;
  }

  return (
    <section className="bg-surface-container border border-outline-variant p-6 relative flex flex-col md:flex-row justify-between items-center gap-6">
      <div className="absolute top-0 left-0 w-full h-[4px] bg-primary-container"></div>
      
      <div className="flex items-center gap-6 flex-1">
        {/* Avatar */}
        <div className="w-20 h-20 border-2 border-primary-container p-1 bg-surface-container-lowest flex-shrink-0 flex items-center justify-center">
          {playerData?.avatarUrl ? (
            <img
              alt="Player Avatar"
              className="w-full h-full grayscale contrast-125 brightness-110"
              src={playerData.avatarUrl}
            />
          ) : (
            <span className="material-symbols-outlined text-6xl text-primary-container">
              account_circle
            </span>
          )}
        </div>

        {/* Player Info */}
        <div className="flex flex-col gap-1 flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="font-arcade text-2xl text-on-surface">
              {playerData.username}
            </h2>
            {playerData.isPremium && (
              <div className="flex items-center bg-secondary-container px-2 py-1 gap-1">
                <span
                  className="material-symbols-outlined text-xs text-on-secondary-container"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  workspace_premium
                </span>
                <span className="text-[10px] font-bold text-on-secondary-container uppercase tracking-tighter">
                  PREMIUM
                </span>
              </div>
            )}
          </div>

          {/* Stats Row */}
          <div className="flex items-center gap-4 text-outline font-bold text-xs uppercase tracking-widest flex-wrap">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">flag</span>
              {playerData.country}
            </span>
            <span className="text-primary">LVL {playerData.level}</span>
            <span className="text-[#3d484d]">ID: {playerData.playerId}</span>
          </div>
        </div>
      </div>

      {/* Edit Button */}
      <button
        onClick={onEditProfile}
        className="border border-outline text-xs px-4 py-2 hover:bg-surface-container-highest transition-all duration-75 active:translate-y-[2px] font-bold uppercase tracking-widest flex items-center gap-2 flex-shrink-0"
      >
        <span className="material-symbols-outlined text-sm">edit</span>
        EDIT PROFILE
      </button>
    </section>
  );
}
