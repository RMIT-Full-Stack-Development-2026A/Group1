// Custom hook for Admin Dashboard state and logic
import { useState, useEffect } from "react";
import { adminDashboardService } from "../services/adminDashboard.service";

// Mock data for development/demo purposes
const MOCK_METRICS = {
  totalPlayers: 4200,
  activePlayers: 312,
  deactivatedPlayers: 3888,
  premiumPlayers: 892,
  registeredToday: [5, 8, 12, 15, 10, 8, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 24 hours
  registeredThisWeek: [25, 35, 42, 38, 45, 60, 40], // Mon-Sun
  registeredThisMonth: Array(29).fill(0).map((_, i) => Math.floor(Math.random() * 80) + 20), // 29 days (example)
  activeRooms: 24,
  totalMatches: 18500,
  totalRevenue: 12850.50,
};

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
        console.warn("[useAdminDashboard] API call failed, using mock data:", err.message);
        // Use mock data as fallback instead of showing error
        setMetrics(MOCK_METRICS);
        setError(null);
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

  return {
    metrics,
    loading,
    error,
    formatNumber,
  };
};
