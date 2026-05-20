// Admin Dashboard Service - API calls for dashboard metrics
import http from "@/utils/httpHelper";

export const adminDashboardService = {
  // Fetch aggregated dashboard metrics
  async getDashboardMetrics() {
    try {
      const response = await http.get("/admin/dashboard");
      return response.data;
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
      throw error;
    }
  },
};
