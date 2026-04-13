// Profile Service - API calls for profile data and match history
import http from "@/utils/httpHelper";

export const profileService = {
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

  // Update player profile
  async updateProfile(profileData) {
    try {
      const response = await http.put("/profile/update", profileData);
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
};
