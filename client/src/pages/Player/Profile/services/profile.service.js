// Profile Service - API calls for profile data and match history
import http from "@/utils/httpHelper";

export const profileService = {
  // Fetch aggregated profile overview (recommended for profile page)
  async getProfileOverview() {
    try {
      const response = await http.get("/profile/overview");
      return response.data;
    } catch (error) {
      console.error("Error fetching profile overview:", error);
      throw error;
    }
  },

  // Fetch player profile data
  async getPlayerProfile() {
    try {
      const response = await http.get("/profile");
      return response.data;
    } catch (error) {
      console.error("Error fetching player profile:", error);
      throw error;
    }
  },

  // Fetch player match history with optional filters
  async getMatchHistory(filters = {}) {
    try {
      // Filter out undefined and empty string values to prevent "undefined" in query string
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([, value]) => value !== undefined && value !== "")
      );
      const params = new URLSearchParams(cleanFilters);
      const response = await http.get(`/games?${params}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching match history:", error);
      throw error;
    }
  },

  // Update player profile (email, username, country)
  async updateProfile(updateData) {
    try {
      const payload = {};
      if (updateData.email) payload.email = updateData.email;
      if (updateData.username) payload.username = updateData.username;
      if (updateData.country) payload.country = updateData.country;

      const response = await http.put("/profile/update", payload);
      return response.data;
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  },

  // Fetch specific match replay data
  async getMatchReplay(matchId) {
    try {
      const response = await http.get(`/games/${matchId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching match replay:", error);
      throw error;
    }
  },

  // Change player password (requires old password for verification)
  async changePassword(passwordData) {
    try {
      console.log("[profileService] changePassword called with fields:", Object.keys(passwordData));
      const payload = {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword,
      };
      console.log("[profileService] Sending payload to /profile/password:", {
        oldPassword: "***",
        newPassword: "***",
        confirmPassword: "***"
      });
      // Skip global logout on 401 for password validation errors
      const response = await http.patch("/profile/password", payload, {
        skipGlobalAuthError: true
      });
      console.log("[profileService] Password change response:", response);
      return response.data;
    } catch (error) {
      // Handle password validation errors without triggering global logout
      const errorData = error.response?.data;
      console.error("[profileService] Error changing password:", errorData || error.message);
      
      // Create a new error with the backend message but don't trigger logout
      const customError = new Error(errorData?.message || error.message);
      customError.isPasswordValidationError = true;
      customError.errorData = errorData;
      throw customError;
    }
  },

  // Upload/update player avatar
  // Backend: POST /api/v1/profile/avatar - Handles Sharp processing (200x200, WebP, quality 80) and Cloudinary upload
  async uploadAvatar(file) {
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      // When passing FormData to axios, it automatically detects and sets:
      // Content-Type: multipart/form-data with the correct boundary
      // Do NOT manually set Content-Type header as it interferes with FormData
      const response = await http.post("/profile/avatar", formData);
      return response;
    } catch (error) {
      console.error("Error uploading avatar:", error);
      throw error;
    }
  },
};
