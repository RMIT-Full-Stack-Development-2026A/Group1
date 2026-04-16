// Custom hook for managing profile page state and logic
import { useState, useEffect } from "react";
import { profileService } from "../services/profile.service";
import { countryService } from "@/services/countryService";

// Mock match data for preview/layout purposes
const MOCK_MATCHES = [
  {
    id: "0842",
    date: "2070.10.24 14:22",
    gameType: "ONLINE_MATCH",
    opponent: "CYBER_PUNK_42",
    result: "WIN",
    startTime: "14:22",
    endTime: "14:27",
    canReplay: true,
  },
  {
    id: "0841",
    date: "2070.10.24 14:10",
    gameType: "TWO_PLAYERS",
    opponent: "X_TERMINATOR_X",
    result: "LOSS",
    startTime: "14:10",
    endTime: "14:11",
    canReplay: true,
  },
  {
    id: "0840",
    date: "2070.10.23 23:58",
    gameType: "SINGLE_PLAYER",
    opponent: "BOT_LEVEL_MAX",
    result: "ABORT",
    startTime: "23:58",
    endTime: "23:59",
    canReplay: false,
  },
  {
    id: "0839",
    date: "2070.10.23 22:15",
    gameType: "ONLINE_MATCH",
    opponent: "NEO_TOKYO_QUEEN",
    result: "WIN",
    startTime: "22:15",
    endTime: "22:19",
    canReplay: true,
  },
  {
    id: "0838",
    date: "2070.10.23 20:05",
    gameType: "TWO_PLAYERS",
    opponent: "SILENT_SHADOW",
    result: "DRAW",
    startTime: "20:05",
    endTime: "20:08",
    canReplay: true,
  },
  {
    id: "0837",
    date: "2070.10.23 18:45",
    gameType: "SINGLE_PLAYER",
    opponent: "NEON_KNIGHT",
    result: "WIN",
    startTime: "18:45",
    endTime: "18:47",
    canReplay: true,
  },
];

// Mock player data for preview/layout purposes
const MOCK_PLAYER_DATA = {
  id: "player_001",
  username: "PLAYER_01",
  email: "player01@example.com",
  isPremium: true,
  country: "USA",
  level: 42,
  playerId: "88-BF-9021",
  avatarUrl: null,
  stats: {
    wins: 1204,
    losses: 432,
    draws: 156,
    winRate: 74.2,
  },
};

export const useProfile = () => {
  const [playerData, setPlayerData] = useState(MOCK_PLAYER_DATA);
  const [countryFlag, setCountryFlag] = useState(null);
  const [matchHistory, setMatchHistory] = useState(MOCK_MATCHES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter and pagination state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterResult, setFilterResult] = useState("ALL RESULTS");
  const [filterGameType, setFilterGameType] = useState("GAME TYPE");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState("endedAt"); // 'endedAt' or 'startedAt'
  const [sortOrder, setSortOrder] = useState("desc"); // 'asc' or 'desc'
  const [currentPage, setCurrentPage] = useState(1);
  const [totalMatches, setTotalMatches] = useState(MOCK_MATCHES.length);

  // Edit Profile Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [countries, setCountries] = useState([]);
  const [countriesLoading, setCountriesLoading] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Fetch player profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await profileService.getProfileOverview();
        
        // The httpHelper already unwraps axios response, so response is { data: {...}, message: "..." }
        const apiData = response.data || response;
        
        console.log('[useProfile] API Response structure:', response);
        console.log('[useProfile] Extracted data:', apiData);
        
        // Map API response to player data structure
        const mappedData = {
          id: apiData?.user?.id || apiData?.id,
          username: apiData?.user?.username || apiData?.username,
          email: apiData?.user?.email || apiData?.email,
          isPremium: apiData?.subscription?.isPremium || apiData?.user?.isPremium || apiData?.isPremium || false,
          country: apiData?.user?.country || apiData?.country,
          level: apiData?.user?.level || apiData?.level || 1,
          playerId: apiData?.user?.id || apiData?.id,
          avatarUrl: apiData?.user?.avatar || apiData?.avatar,
          stats: {
            wins: apiData?.stats?.wins || 0,
            losses: apiData?.stats?.losses || 0,
            draws: apiData?.stats?.draws || 0,
            winRate: apiData?.stats?.totalGames > 0 
              ? ((apiData.stats.wins / apiData.stats.totalGames) * 100).toFixed(1)
              : 0,
          },
        };
        
        console.log('[useProfile] Mapped player data:', mappedData);
        setPlayerData(mappedData);

        // Fetch country flag asynchronously
        if (mappedData.country) {
          const flagData = await countryService.getCountryFlag(mappedData.country);
          if (flagData) {
            setCountryFlag(flagData);
            console.log('[useProfile] Fetched country flag:', flagData);
          }
        }
      } catch (err) {
        console.warn("Using mock player data due to API error:", err.message);
        setPlayerData(MOCK_PLAYER_DATA);
        // setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Fetch countries for edit profile modal
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setCountriesLoading(true);
        const data = await countryService.getCountries();
        setCountries(data);
      } catch (err) {
        console.warn("Error loading countries:", err.message);
        // Fallback to some default countries
        setCountries([
          { name: "USA", code: "US" },
          { name: "United Kingdom", code: "GB" },
          { name: "Canada", code: "CA" },
          { name: "Australia", code: "AU" },
          { name: "Vietnam", code: "VN" },
        ]);
      } finally {
        setCountriesLoading(false);
      }
    };

    fetchCountries();
  }, []);

  // Transform backend match data to frontend format
  // When backend API is completed, it will return startedAt and endedAt as ISO 8601 dates
  // This function extracts the time portion for display
  const transformMatchData = (backendMatch) => {
    const extractTimeFromISO = (isoDate) => {
      if (!isoDate) return "00:00";
      return new Date(isoDate).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    };

    const extractDateFromISO = (isoDate) => {
      if (!isoDate) return "";
      const date = new Date(isoDate);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).replace(/\//g, ".");
    };

    return {
      id: backendMatch.sessionNumber || backendMatch.id,
      date: extractDateFromISO(backendMatch.startedAt),
      gameType: backendMatch.gameType,
      opponent: backendMatch.participants?.[1]?.usernameSnapshot || backendMatch.opponent,
      result: backendMatch.status === "FINISHED" 
        ? "WIN" // TODO: Check winnerParticipantIndex when available
        : backendMatch.status === "DRAW" 
        ? "DRAW" 
        : "ABORT",
      startTime: extractTimeFromISO(backendMatch.startedAt),
      endTime: extractTimeFromISO(backendMatch.endedAt),
      canReplay: backendMatch.moves && backendMatch.moves.length > 0,
    };
  };

  // Fetch match history with filters
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        const filters = {
          q: searchQuery,
          result: filterResult === "ALL RESULTS" ? undefined : filterResult,
          gameType: filterGameType === "GAME TYPE" ? undefined : filterGameType,
          from: dateFrom ? new Date(dateFrom).toISOString() : undefined,
          to: dateTo ? new Date(dateTo).toISOString() : undefined,
          sortBy: sortBy,
          sortOrder: sortOrder,
          page: currentPage,
        };

        const response = await profileService.getMatchHistory(filters);
        const items = response.data?.items || [];
        
        if (items.length === 0) {
          // Use mock data if API returns empty
          setMatchHistory(MOCK_MATCHES);
          setTotalMatches(MOCK_MATCHES.length);
        } else {
          // Transform backend data to frontend format for startTime/endTime display
          const transformedMatches = items.map(transformMatchData);
          setMatchHistory(transformedMatches);
          setTotalMatches(response.data?.total || 0);
        }
      } catch (err) {
        console.warn("Using mock match data due to API error");
        // Use mock data on error
        setMatchHistory(MOCK_MATCHES);
        setTotalMatches(MOCK_MATCHES.length);
        // setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [searchQuery, filterResult, filterGameType, dateFrom, dateTo, sortBy, sortOrder, currentPage]);

  // Handle edit profile - open modal
  const handleEditProfile = () => {
    setIsEditModalOpen(true);
  };

  // Handle saving profile changes
  const handleSaveProfile = async (updateData) => {
    try {
      setIsSavingProfile(true);
      
      // Call API to update profile
      if (updateData.email || updateData.username || updateData.country) {
        const profileUpdateData = {};
        if (updateData.email) profileUpdateData.email = updateData.email;
        if (updateData.username) profileUpdateData.username = updateData.username;
        if (updateData.country) profileUpdateData.country = updateData.country;
        
        await profileService.updateProfile(profileUpdateData);
      }

      // Call API to change password if provided
      if (updateData.password) {
        await profileService.changePassword({ 
          password: updateData.password,
          oldPassword: updateData.oldPassword 
        });
      }

      // Update local player data
      setPlayerData((prev) => ({
        ...prev,
        email: updateData.email || prev.email,
        username: updateData.username || prev.username,
        country: updateData.country || prev.country,
      }));

      // If country changed, fetch new flag
      if (updateData.country) {
        const flagData = await countryService.getCountryFlag(updateData.country);
        if (flagData) {
          setCountryFlag(flagData);
        }
      }

      // Close modal and refresh profile data
      setIsEditModalOpen(false);
      
      // Optional: Refresh full profile data to sync with backend
      const response = await profileService.getProfileOverview();
      const apiData = response.data || response;
      
      const mappedData = {
        id: apiData?.user?.id || apiData?.id,
        username: apiData?.user?.username || apiData?.username,
        email: apiData?.user?.email || apiData?.email,
        isPremium: apiData?.subscription?.isPremium || apiData?.user?.isPremium || apiData?.isPremium || false,
        country: apiData?.user?.country || apiData?.country,
        level: apiData?.user?.level || apiData?.level || 1,
        playerId: apiData?.user?.id || apiData?.id,
        avatarUrl: apiData?.user?.avatar || apiData?.avatar,
        stats: {
          wins: apiData?.stats?.wins || 0,
          losses: apiData?.stats?.losses || 0,
          draws: apiData?.stats?.draws || 0,
          winRate: apiData?.stats?.totalGames > 0 
            ? ((apiData.stats.wins / apiData.stats.totalGames) * 100).toFixed(1)
            : 0,
        },
      };
      
      setPlayerData(mappedData);

      return true;
    } catch (err) {
      console.error("Error saving profile:", err);
      return false;
    } finally {
      setIsSavingProfile(false);
    }
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

  // Handle sort by column
  const handleSortBy = (column) => {
    // If clicking the same column, toggle order; otherwise set new column with desc order
    if (sortBy === column) {
      setSortOrder(sortOrder === "desc" ? "asc" : "desc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
    setCurrentPage(1); // Reset to page 1 when sorting
  };

  // Handle date range changes
  const handleDateFromChange = (date) => {
    setDateFrom(date);
    setCurrentPage(1);
  };

  const handleDateToChange = (date) => {
    setDateTo(date);
    setCurrentPage(1);
  };

  // Handle avatar update
  const handleAvatarUpdate = (previewUrl, serverUrl) => {
    setPlayerData((prev) => ({
      ...prev,
      avatarUrl: serverUrl || previewUrl,
    }));
  };

  // Placeholder mock data for stats - replace with real API data
  const getStatsConfig = () => [
    {
      label: "WINS",
      value: playerData?.stats?.wins?.toLocaleString() || "0",
      icon: "trending_up",
      barWidth: 100,
      color: "bg-primary-container text-primary-container",
    },
    {
      label: "LOSSES",
      value: playerData?.stats?.losses?.toLocaleString() || "0",
      icon: "trending_down",
      barWidth: 100,
      color: "bg-error-container text-error-container",
    },
    {
      label: "DRAWS",
      value: playerData?.stats?.draws?.toLocaleString() || "0",
      icon: "balance",
      barWidth: 100,
      color: "bg-outline text-outline",
    },
    {
      label: "WIN RATE",
      value: `${playerData?.stats?.winRate || 0}%`,
      icon: "star",
      barWidth: 100,
      color: "bg-tertiary-container text-tertiary-container",
    },
  ];

  return {
    playerData,
    countryFlag,
    matchHistory,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    filterResult,
    setFilterResult,
    filterGameType,
    setFilterGameType,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    handleDateFromChange,
    handleDateToChange,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    handleSortBy,
    currentPage,
    setCurrentPage,
    totalMatches,
    handleEditProfile,
    handleReplay,
    handlePageChange,
    handleAvatarUpdate,
    stats: getStatsConfig(),
    // Edit modal state and functions
    isEditModalOpen,
    setIsEditModalOpen,
    countries,
    countriesLoading,
    isSavingProfile,
    handleSaveProfile,
  };
};
