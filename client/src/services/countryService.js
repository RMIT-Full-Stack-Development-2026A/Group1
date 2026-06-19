// Country Service - Fetch country data from the backend proxy.
// Caches results to reduce API calls.

import http from "../utils/httpHelper";
import { API_ENDPOINTS } from "../config/apiConfig";

const countryCache = {
  all: null,
  flags: {},
};

const loadCountries = async () => {
  if (countryCache.all) {
    return countryCache.all;
  }

  const response = await http.get(API_ENDPOINTS.COUNTRIES.LIST);
  const countryList = response?.data || [];

  countryCache.all = countryList;
  return countryList;
};

export const countryService = {
  /**
   * Fetch country flag and details by country name.
   * @param {string} countryName - Country name (e.g., "Algeria", "United States")
   * @returns {Promise<{flag: string, flagAlt: string} | null>} Flag emoji/URL or null if not found
   */
  async getCountryFlag(countryName) {
    if (!countryName) return null;

    const cacheKey = countryName.trim().toLowerCase();
    if (countryCache.flags[cacheKey]) {
      return countryCache.flags[cacheKey];
    }

    try {
      const countries = await loadCountries();
      const country = countries.find(
        (entry) => entry.name.common.toLowerCase() === cacheKey
      );

      if (!country) {
        return null;
      }

      const flagData = {
        flag: country.flags.svg || country.flags.png || country.flags.emoji,
        flagAlt: country.name.common,
      };

      countryCache.flags[cacheKey] = flagData;
      return flagData;
    } catch (error) {
      console.warn(`[countryService] Failed to fetch flag for ${countryName}:`, error);
      return null;
    }
  },

  /**
   * Get country flag synchronously from cache (if available).
   * Useful for rendering after initial load.
   */
  getCountryFlagSync(countryName) {
    if (!countryName) return null;

    return countryCache.flags[countryName.trim().toLowerCase()] || null;
  },

  /**
   * Get all available countries from the backend proxy.
   * Returns data in the legacy shape expected by the UI: {name: {common: string}, flags: {emoji, svg, png}}
   * @returns {Promise<Array>} Array of country objects with name.common and flags
   */
  async getCountries() {
    try {
      return await loadCountries();
    } catch (error) {
      console.warn('[countryService] Failed to fetch countries list:', error);
      throw error;
    }
  },

  /**
   * Clear country cache (useful for testing).
   */
  clearCache() {
    countryCache.all = null;
    countryCache.flags = {};
  },
};