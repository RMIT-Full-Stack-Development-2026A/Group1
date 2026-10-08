// Custom hook for Admin Dashboard state and logic
import { formatCount } from "@/utils/formatNumber";
import { useState, useEffect } from "react";
import { adminDashboardService } from "../services/adminDashboard.service";

export const useAdminDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const shiftHourlySeriesToVietnamTime = (series = []) => {
    if (!Array.isArray(series) || series.length !== 24) {
      return [];
    }

    // Convert UTC buckets to Vietnam local time (UTC+7).
    return [...series.slice(17), ...series.slice(0, 17)];
  };

  // Fetch dashboard metrics on mount
  useEffect(() => {
    const fetchDashboardMetrics = async () => {
      try {
        setLoading(true);
        const response = await adminDashboardService.getDashboardMetrics();

        // Extract data from response
        const dashboardData = response.data || response;

        

        // Helper: sum array values
        const sumArray = (arr) => (Array.isArray(arr) ? arr.reduce((a, b) => a + b, 0) : 0);

        // Format metrics for display
        const formattedMetrics = {
          totalPlayers: dashboardData?.totalPlayers || 0,
          activePlayers: dashboardData?.activePlayers || 0,
          deactivatedPlayers: Math.max((dashboardData?.totalPlayers || 0) - (dashboardData?.activePlayers || 0), 0),
          premiumPlayers: dashboardData?.premiumPlayers || 0,
          
          // Summary numbers (sums from time-series arrays)
          newPlayersToday: sumArray(dashboardData?.registeredToday),
          newPlayersThisWeek: sumArray(dashboardData?.registeredThisWeek),
          newPlayersThisMonth: sumArray(dashboardData?.registeredThisMonth),
          
          // Raw time-series data (for charts)
          registrationsByHour: shiftHourlySeriesToVietnamTime(dashboardData?.registeredToday),
          registrationsByDay: dashboardData?.registeredThisWeek || [],
          registrationsByMonth: dashboardData?.registeredThisMonth || [],
          
          activeRooms: dashboardData?.activeRooms || 0,
          totalMatches: dashboardData?.totalMatches || 0,
          totalRevenue: dashboardData?.totalRevenue || 0,
        };

        setMetrics(formattedMetrics);
        setError(null);
      } catch (err) {
        console.error("[useAdminDashboard] Failed to load dashboard metrics:", err);
        setError(err.message || "Could not load the dashboard.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardMetrics();
  }, []);

  // Format large numbers with commas and K suffix
  const formatNumber = (num) => formatCount(num);

  return {
    metrics,
    loading,
    error,
    formatNumber,
  };
};
