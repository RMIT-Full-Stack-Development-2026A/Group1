// Profile Header Sub-component - Displays player avatar, username, and basic info
import React, { useRef, useState } from "react";
import { profileService } from "../services/profile.service";

export default function ProfileHeader({ playerData, countryFlag, onEditProfile, onAvatarUpdate }) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setUploadError("Please select an image file");
      setTimeout(() => setUploadError(null), 3000);
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("File size must be less than 5MB");
      setTimeout(() => setUploadError(null), 3000);
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      // TODO: Backend endpoint POST /api/v1/profile/avatar not yet implemented
      // Once backend is ready, this will upload the avatar
      const result = await profileService.uploadAvatar(file);
      // Create local preview URL
      const previewUrl = URL.createObjectURL(file);
      onAvatarUpdate?.(previewUrl, result?.avatarUrl || previewUrl);
    } catch (error) {
      console.error("Avatar upload error:", error);
      setUploadError(error.message || "Failed to upload avatar");
      setTimeout(() => setUploadError(null), 3000);
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };
  if (!playerData) {
    return <div className="h-32 bg-surface-container animate-pulse"></div>;
  }

  return (
    <section 
      className="border border-outline-variant p-6 relative flex flex-col md:flex-row justify-between items-center gap-6"
      style={{ backgroundColor: "#1b1c2c" }}
    >
      <div 
        className="absolute top-0 left-0 w-full z-10"
        style={{ 
          height: "4px",
          backgroundColor: "#4cc9f0"
        }}
      ></div>
      
      <div className="flex items-center gap-6 flex-1">
        {/* Avatar with Edit Overlay */}
        <div className="relative w-20 h-20 flex-shrink-0 group cursor-pointer">
          <div className="w-full h-full border-2 border-primary-container p-1 bg-surface-container-lowest flex items-center justify-center relative overflow-hidden">
            {playerData?.avatarUrl ? (
              <img
                alt="Player Avatar"
                className="w-full h-full grayscale contrast-125 brightness-110 group-hover:brightness-50 group-hover:grayscale-0 transition-all duration-200"
                src={playerData.avatarUrl}
              />
            ) : (
              <span className="material-symbols-outlined text-6xl text-primary-container group-hover:text-opacity-40 transition-all duration-200">
                account_circle
              </span>
            )}
            
            {/* Hover Overlay with Pen Icon */}
            <div 
              className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              <button
                onClick={handleAvatarClick}
                disabled={uploading}
                className="p-2 text-primary-cyan hover:text-opacity-70 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                title="Change avatar"
              >
                <span className="material-symbols-outlined text-xl">edit</span>
              </button>
            </div>
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
            aria-label="Upload avatar"
          />

          {/* Upload Indicator */}
          {uploading && (
            <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center rounded-none">
              <div className="animate-spin">
                <span className="material-symbols-outlined text-white">progress_activity</span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {uploadError && (
            <div className="absolute -bottom-8 left-0 right-0 whitespace-nowrap text-[10px] text-error-container bg-error-container bg-opacity-20 p-1 rounded-none text-center">
              {uploadError}
            </div>
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
              {countryFlag ? (
                <img
                  src={countryFlag.flag}
                  alt={countryFlag.flagAlt}
                  className="w-6 h-4 object-cover"
                />
              ) : (
                <span className="material-symbols-outlined text-sm">flag</span>
              )}
              {playerData.country}
            </span>
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
