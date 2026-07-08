// Custom hook for managing profile page state and logic
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { profileService } from "../services/profile.service";
import { countryService } from "@/services/countryService";

/**
 * Helper function to determine if user is currently premium
 * @param {string | null} premiumExpiresAt - ISO date string or null from API
 * @returns {boolean} true if premium is active (expiry date is in the future)
 */
const isPremiumActive = (premiumExpiresAt) => {
  // DEVELOPMENT: Uncomment the line below to hardcode premium for testing
  // return true;
  
  if (!premiumExpiresAt) return false;
  const expiryDate = new Date(premiumExpiresAt);
  return expiryDate > new Date();
};

export const useProfile = () => {
  const navigate = useNavigate();
  const [playerData, setPlayerData] = useState(null);
  const [countryFlag, setCountryFlag] = useState(null);
  const [matchHistory, setMatchHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter and pagination state - inputs (what user is adjusting)
  const [searchQuery, setSearchQuery] = useState("");
  const [filterResult, setFilterResult] = useState("ALL RESULTS");
  const [filterGameType, setFilterGameType] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState("endedAt"); // 'endedAt' or 'startedAt'
  const [sortOrder, setSortOrder] = useState("desc"); // 'asc' or 'desc'
  const [currentPage, setCurrentPage] = useState(1);
  const [totalMatches, setTotalMatches] = useState(0);

  // Applied filters state - only these trigger API calls
  const [appliedSearchQuery, setAppliedSearchQuery] = useState("");
  const [appliedFilterResult, setAppliedFilterResult] = useState("ALL RESULTS");
  const [appliedFilterGameType, setAppliedFilterGameType] = useState("");
  const [appliedDateFrom, setAppliedDateFrom] = useState("");
  const [appliedDateTo, setAppliedDateTo] = useState("");
  const [appliedSortBy, setAppliedSortBy] = useState("endedAt");
  const [appliedSortOrder, setAppliedSortOrder] = useState("desc");
  const [appliedPage, setAppliedPage] = useState(1);

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
        
        
        
        
        // Map API response to player data structure
        const premiumExpiresAt =
          apiData?.user?.premiumExpiresAt ||
          apiData?.subscription?.premiumExpiresAt ||
          apiData?.premiumExpiresAt;

        const mappedData = {
          id: apiData?.user?.id || apiData?.id,
          username: apiData?.user?.username || apiData?.username,
          email: apiData?.user?.email || apiData?.email,
          isPremium: isPremiumActive(premiumExpiresAt),
          country: apiData?.user?.country || apiData?.country,
          level: apiData?.user?.level || apiData?.level || 1,
          playerId: apiData?.user?.id || apiData?.id,
          avatarUrl: apiData?.user?.avatar || apiData?.avatar,
          stats: {
            wins: apiData?.stats?.wins || 0,
            losses: apiData?.stats?.losses || 0,
            draws: apiData?.stats?.draws || 0,
            winRate: (apiData?.stats?.totalGames - (apiData?.stats?.aborted || 0)) > 0 
              ? ((apiData.stats.wins / (apiData.stats.totalGames - (apiData.stats.aborted || 0))) * 100).toFixed(1)
              : 0,
          },
        };
        
        
        setPlayerData(mappedData);

        // Fetch country flag asynchronously
        if (mappedData.country) {
          const flagData = await countryService.getCountryFlag(mappedData.country);
          if (flagData) {
            setCountryFlag(flagData);
            
          }
        }
      } catch (err) {
        console.error("Error fetching profile:", err.message);
        setError(err.message);
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
          { name: { common: "United States" }, flags: { emoji: "🇺🇸" } },
          { name: { common: "United Kingdom" }, flags: { emoji: "🇬🇧" } },
          { name: { common: "Canada" }, flags: { emoji: "🇨🇦" } },
          { name: { common: "Australia" }, flags: { emoji: "🇦🇺" } },
          { name: { common: "Vietnam" }, flags: { emoji: "🇻🇳" } },
        ]);
      } finally {
        setCountriesLoading(false);
      }
    };

    fetchCountries();
  }, []);

  // Transform backend match data to frontend format
  // Maps API response structure to display format
  const transformMatchData = (backendMatch) => {
    const extractTimeFromISO = (isoDate) => {
      if (!isoDate) return "00:00:00";
      return new Date(isoDate).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
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

    // Map API viewerResult to display format
    const mapResult = (viewerResult) => {
      if (viewerResult === "ABORTED") return "ABORT";
      if (viewerResult === "WIN") return "WIN";
      if (viewerResult === "LOSE") return "LOSS";
      return "DRAW";
    };

    return {
      id: backendMatch._id || backendMatch.id,
      sessionNumber: backendMatch.sessionNumber,
      date: extractDateFromISO(backendMatch.startedAt),
      gameType: backendMatch.gameType,
      opponent: backendMatch.opponentName,
      opponentAvatar: backendMatch.opponentAvatar || null,
      result: mapResult(backendMatch.viewerResult),
      startTime: extractTimeFromISO(backendMatch.startedAt),
      endTime: extractTimeFromISO(backendMatch.endedAt),
      canReplay: backendMatch.status === "FINISHED" || backendMatch.status === "DRAW",
    };
  };

  // Apply filters - called when Filter button is clicked
  const handleApplyFilters = () => {
    setAppliedSearchQuery(searchQuery);
    setAppliedFilterResult(filterResult);
    setAppliedFilterGameType(filterGameType);
    setAppliedDateFrom(dateFrom);
    setAppliedDateTo(dateTo);
    setAppliedPage(1); // Reset to page 1 when applying new filters
  };

  // Fetch match history with filters - only when applied filters change
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        const itemsPerPage = 5;
        
        const filters = {
          q: appliedSearchQuery,
          result: appliedFilterResult === "ALL RESULTS" ? undefined : appliedFilterResult,
          gameType: appliedFilterGameType || undefined,
          from: appliedDateFrom ? new Date(appliedDateFrom + 'T00:00:00').toISOString() : undefined,
          to: appliedDateTo ? new Date(appliedDateTo + 'T23:59:59.999').toISOString() : undefined,
          sortBy: appliedSortBy,
          sortOrder: appliedSortOrder,
          page: appliedPage,
          limit: itemsPerPage,
        };

        

        const response = await profileService.getMatchHistory(filters);

        

        const items = response.data?.items || response?.items || [];
        let total = response.data?.total || response?.total || 0;
        
        
        
        
        // Transform backend data to frontend format
        let transformedMatches = items.map(transformMatchData);
        
        
        
        // Apply in-memory filtering for WIN/LOSS/DRAW/ABORT since backend returns all games
        if (appliedFilterResult === "WIN") {
          transformedMatches = transformedMatches.filter(match => match.result === "WIN");
          
        } else if (appliedFilterResult === "LOSS") {
          transformedMatches = transformedMatches.filter(match => match.result === "LOSS");
          
        } else if (appliedFilterResult === "DRAW") {
          transformedMatches = transformedMatches.filter(match => match.result === "DRAW");
          
        } else if (appliedFilterResult === "ABORT") {
          transformedMatches = transformedMatches.filter(match => match.result === "ABORT");
          
        }
        
        setMatchHistory(transformedMatches);
        // Use the API's total count for pagination (NOT the filtered count)
        // This ensures pagination works correctly even with WIN/LOSS filters
        setTotalMatches(total);
        
      } catch (err) {
        console.error("Error fetching match history:", err);
        setMatchHistory([]);
        setTotalMatches(0);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [appliedSearchQuery, appliedFilterResult, appliedFilterGameType, appliedDateFrom, appliedDateTo, appliedSortBy, appliedSortOrder, appliedPage]);

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

      // Call API to change password if provided (check for newPassword, not password)
      if (updateData.newPassword) {
        try {
          await profileService.changePassword({ 
            oldPassword: updateData.oldPassword,
            newPassword: updateData.newPassword,
            confirmPassword: updateData.confirmPassword,
          });
        } catch (passwordError) {
          // Re-throw with context for caller
          const err = new Error(passwordError.message);
          err.isPasswordValidationError = true;
          throw err;
        }
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
        isPremium: isPremiumActive(apiData?.user?.premiumExpiresAt || apiData?.premiumExpiresAt),
        country: apiData?.user?.country || apiData?.country,
        level: apiData?.user?.level || apiData?.level || 1,
        playerId: apiData?.user?.id || apiData?.id,
        avatarUrl: apiData?.user?.avatar || apiData?.avatar,
        stats: {
          wins: apiData?.stats?.wins || 0,
          losses: apiData?.stats?.losses || 0,
          draws: apiData?.stats?.draws || 0,
          winRate: (apiData?.stats?.totalGames - (apiData?.stats?.aborted || 0)) > 0 
            ? ((apiData.stats.wins / (apiData.stats.totalGames - (apiData.stats.aborted || 0))) * 100).toFixed(1)
            : 0,
        },
      };
      
      setPlayerData(mappedData);

      return true;
    } catch (err) {
      // Re-throw so modal can catch and display the error
      throw err;
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Handle replay button click - navigate to match replay page
  const handleReplay = (matchId) => {
    
    navigate(`/replay/${matchId}`);
  };

  // Handle pagination
  const handlePageChange = (pageNum) => {
    setAppliedPage(pageNum);
  };

  // Handle sort by column
  const handleSortBy = (column) => {
    // If clicking the same column, toggle order; otherwise set new column with desc order
    if (appliedSortBy === column) {
      setAppliedSortOrder(appliedSortOrder === "desc" ? "asc" : "desc");
    } else {
      setAppliedSortBy(column);
      setAppliedSortOrder("desc");
    }
    setAppliedPage(1); // Reset to page 1 when sorting
  };

  // Reset all filters to default values
  const handleResetFilters = () => {
    setSearchQuery("");
    setFilterResult("ALL RESULTS");
    setFilterGameType("");
    setDateFrom("");
    setDateTo("");
    setAppliedSearchQuery("");
    setAppliedFilterResult("ALL RESULTS");
    setAppliedFilterGameType("");
    setAppliedDateFrom("");
    setAppliedDateTo("");
    setAppliedPage(1);
    setAppliedSortBy("endedAt");
    setAppliedSortOrder("desc");
  };

  // Handle date range changes
  const handleDateFromChange = (date) => {
    setDateFrom(date);
  };

  const handleDateToChange = (date) => {
    setDateTo(date);
  };

  // Handle avatar update
  const handleAvatarUpdate = (previewUrl, serverUrl) => {
    setPlayerData((prev) => ({
      ...prev,
      avatarUrl: serverUrl || previewUrl,
    }));
  };

  // Calculate stats display configuration from real API data
  const getStatsConfig = () => {
    const winRate = playerData?.stats?.winRate || 0;
    const totalGames = (playerData?.stats?.wins || 0) + (playerData?.stats?.losses || 0) + (playerData?.stats?.draws || 0);
    
    return [
      {
        label: "WINS",
        value: playerData?.stats?.wins?.toLocaleString() || "0",
        icon: "trending_up",
        barWidth: totalGames > 0 ? ((playerData?.stats?.wins || 0) / totalGames) * 100 : 0,
        color: "bg-primary-container text-primary-container",
      },
      {
        label: "LOSSES",
        value: playerData?.stats?.losses?.toLocaleString() || "0",
        icon: "trending_down",
        barWidth: totalGames > 0 ? ((playerData?.stats?.losses || 0) / totalGames) * 100 : 0,
        color: "bg-error-container text-error-container",
      },
      {
        label: "DRAWS",
        value: playerData?.stats?.draws?.toLocaleString() || "0",
        icon: "balance",
        barWidth: totalGames > 0 ? ((playerData?.stats?.draws || 0) / totalGames) * 100 : 0,
        color: "bg-outline text-outline",
      },
      {
        label: "WIN RATE",
        value: `${winRate}%`,
        icon: "star",
        barWidth: winRate,
        color: "bg-tertiary-container text-tertiary-container",
      },
    ];
  };

  return {
    playerData,
    countryFlag,
    matchHistory,
    loading,
    error,
    // Filter inputs (user adjusts these)
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
    // Applied filters (these trigger API calls)
    appliedSortBy,
    appliedSortOrder,
    // Handlers
    handleApplyFilters,
    handleResetFilters,
    handleEditProfile,
    handleSortBy,
    handleReplay,
    handlePageChange,
    currentPage: appliedPage,
    totalMatches,
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
