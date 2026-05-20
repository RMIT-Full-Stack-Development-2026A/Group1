// Profile Header Sub-component - Displays player avatar, username, and basic info
import React, { useRef, useState } from "react";
import { profileService } from "../services/profile.service";

export default function ProfileHeader({ playerData, countryFlag, onEditProfile, onChangePassword, onAvatarUpdate }) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type - backend only accepts JPEG, PNG, WebP
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError("Please select a JPG, PNG, or WebP image");
      setTimeout(() => setUploadError(null), 3000);
      return;
    }

    // Validate file size (max 2MB - matches backend multer config)
    if (file.size > 2 * 1024 * 1024) {
      setUploadError("File size must be less than 2MB");
      setTimeout(() => setUploadError(null), 3000);
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      // Upload file directly - backend handles Sharp processing (resize to 200x200, convert to WebP)
      // No need for frontend resizing as backend will re-process anyway
      const result = await profileService.uploadAvatar(file);
      // Create local preview URL from uploaded file
      const previewUrl = URL.createObjectURL(file);
      onAvatarUpdate?.(previewUrl, result?.avatarUrl || result?.data?.avatar || previewUrl);
    } catch (error) {
      console.error("Avatar upload error:", error);
      setUploadError(error.message || "Failed to process avatar");
      setTimeout(() => setUploadError(null), 3000);
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

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
        <div 
          className="relative w-20 h-20 shrink-0 group cursor-pointer"
          onClick={handleAvatarClick}
        >
          <div className="w-full h-full border-2 border-primary-container p-1 bg-surface-container-lowest flex items-center justify-center relative overflow-hidden">
            {playerData?.avatarUrl ? (
              <img
                alt="Player Avatar"
                className="w-full h-full group-hover:opacity-75 transition-all duration-200 cursor-pointer"
                src={playerData.avatarUrl}
              />
            ) : (
              <span className="material-symbols-outlined text-6xl text-primary-container group-hover:text-opacity-40 transition-all duration-200">
                account_circle
              </span>
            )}
            
            {/* Hover Overlay with Pen Icon */}
            <div 
              className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAvatarClick();
                }}
                disabled={uploading || !playerData}
                className="p-2 text-primary-cyan hover:text-opacity-70 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
          {playerData ? (
            <>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="font-arcade text-2xl text-on-surface">
                  {playerData.username}
                </h2>
                {playerData.isPremium && (
                  <div
                    className="bg-secondary-container text-[#fad100] px-3 py-1 flex items-center gap-2 text-[10px] font-bold border-2 border-on-secondary-container chunky-shadow"
                    title="Premium"
                  >
                    <span
                      className="font-headline material-symbols-outlined text-[#fad100]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      workspace_premium
                    </span>
                    <span>
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
            </>
          ) : (
            <div className="flex flex-col gap-2 flex-1">
              <div className="h-7 bg-surface-container rounded w-32 animate-pulse"></div>
              <div className="h-4 bg-surface-container rounded w-24 animate-pulse"></div>
            </div>
          )}
        </div>
      </div>

      {/* Edit and Action Buttons */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onEditProfile}
          className="border border-outline text-xs px-4 py-2 hover:bg-surface-container-highest transition-all duration-75 active:translate-y-0.5 font-bold uppercase tracking-widest flex items-center gap-2 shrink-0"
        >
          <span className="material-symbols-outlined text-sm">edit</span>
          EDIT PROFILE
        </button>

        <button
          onClick={onChangePassword}
          className="border border-outline text-xs px-4 py-2 hover:bg-surface-container-highest transition-all duration-75 active:translate-y-0.5 font-bold uppercase tracking-widest flex items-center gap-2 shrink-0"
          title="Change your password"
        >
          <span className="material-symbols-outlined text-sm">lock</span>
          CHANGE PASSWORD
        </button>
      </div>
    </section>
  );
}
