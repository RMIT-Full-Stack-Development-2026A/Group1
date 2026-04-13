// Custom hook for managing profile page state and logic
import { useState, useEffect } from "react";
import { profileService } from "../services/profile.service";

export const useProfile = () => {
  const [playerData, setPlayerData] = useState(null);
  const [matchHistory, setMatchHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter and pagination state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterResult, setFilterResult] = useState("ALL RESULTS");
  const [filterGameType, setFilterGameType] = useState("GAME TYPE");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalMatches, setTotalMatches] = useState(0);

  // Fetch player profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const profile = await profileService.getPlayerProfile();
        setPlayerData(profile);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Fetch match history with filters
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        const filters = {
          q: searchQuery,
          result: filterResult === "ALL RESULTS" ? undefined : filterResult,
          gameType: filterGameType === "GAME TYPE" ? undefined : filterGameType,
          page: currentPage,
        };

        const response = await profileService.getMatchHistory(filters);
        setMatchHistory(response.data?.items || []);
        setTotalMatches(response.data?.total || 0);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [searchQuery, filterResult, filterGameType, currentPage]);

  // Handle edit profile
  const handleEditProfile = () => {
    // TODO: Open profile edit modal or redirect to edit page
    console.log("Edit profile clicked");
  };

  // Handle replay button click
  const handleReplay = (matchId) => {
    // TODO: Navigate to replay page with match ID
    console.log("Replay match:", matchId);
  };

  // Handle pagination
  const handlePageChange = (pageNum) => {
    setCurrentPage(pageNum);
  };

  // Placeholder mock data for stats - replace with real API data
  const getStatsConfig = () => [
    {
      label: "WINS",
      value: playerData?.stats?.wins?.toLocaleString() || "0",
      icon: "trending_up",
      barWidth: 75,
      color: "bg-primary-container text-primary-container",
    },
    {
      label: "LOSSES",
      value: playerData?.stats?.losses?.toLocaleString() || "0",
      icon: "trending_down",
      barWidth: 25,
      color: "bg-error-container text-error-container",
    },
    {
      label: "DRAWS",
      value: playerData?.stats?.draws?.toLocaleString() || "0",
      icon: "balance",
      barWidth: 10,
      color: "bg-outline text-outline",
    },
    {
      label: "WIN RATE",
      value: `${playerData?.stats?.winRate || 0}%`,
      icon: "star",
      barWidth: "segmented", // Special case for segmented bar
      color: "bg-tertiary-container text-tertiary-container",
    },
  ];

  return {
    playerData,
    matchHistory,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    filterResult,
    setFilterResult,
    filterGameType,
    setFilterGameType,
    currentPage,
    setCurrentPage,
    totalMatches,
    handleEditProfile,
    handleReplay,
    handlePageChange,
    stats: getStatsConfig(),
  };
};
