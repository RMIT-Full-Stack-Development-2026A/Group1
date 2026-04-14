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
      const params = new URLSearchParams(filters);
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
  // TODO: Backend endpoint PATCH /api/v1/profile/password not yet implemented
  // Route is defined in backend/docs/ENDPOINTS.md but commented out in backend/src/modules/profile/routes/profile.routes.js line 72
  async changePassword(passwordData) {
    try {
      const response = await http.patch("/profile/password", {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.password,
      });
      return response.data;
    } catch (error) {
      console.error("Error changing password:", error);
      throw error;
    }
  },
};
