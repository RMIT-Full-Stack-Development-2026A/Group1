// Custom hook for Admin Dashboard state and logic
import { useState, useEffect } from "react";
import { adminDashboardService } from "../services/adminDashboard.service";

export const useAdminDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch dashboard metrics on mount
  useEffect(() => {
    const fetchDashboardMetrics = async () => {
      try {
        setLoading(true);
        const response = await adminDashboardService.getDashboardMetrics();

        // Extract data from response
        const dashboardData = response.data || response;

        console.log("[useAdminDashboard] Fetched metrics:", dashboardData);

        // Format metrics for display
        const formattedMetrics = {
          totalPlayers: dashboardData?.totalPlayers || 0,
          activePlayers: dashboardData?.activePlayers || 0,
          premiumPlayers: dashboardData?.premiumPlayers || 0,
          activeRooms: dashboardData?.activeRooms || 0,
          totalMatches: dashboardData?.totalMatches || 0,
          totalRevenue: dashboardData?.totalRevenue || 0,
          revenueThisMonth: dashboardData?.revenueThisMonth || 0,
          newPlayersToday: dashboardData?.newPlayersToday || 0,
          newPlayersThisWeek: dashboardData?.newPlayersThisWeek || 0,
          newPlayersThisMonth: dashboardData?.newPlayersThisMonth || 0,
        };

        setMetrics(formattedMetrics);
        setError(null);
      } catch (err) {
        console.error("[useAdminDashboard] Error:", err.message);
        setError(err.message);
        setMetrics(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardMetrics();
  }, []);

  // Format large numbers with commas and K suffix
  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "k";
    }
    return num.toLocaleString();
  };

  // Calculate percentage change (mock data for demo)
  const getPercentageChange = (current, previous = 0) => {
    if (previous === 0) return "+12%";
    const change = ((current - previous) / previous) * 100;
    return change > 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`;
  };

  return {
    metrics,
    loading,
    error,
    formatNumber,
    getPercentageChange,
  };
};
