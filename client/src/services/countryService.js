import http from "../utils/httpHelper";
import { API_ENDPOINTS } from "../config/apiConfig";

const countryCache = {
    all: null,
    flags: {},
};

export const countryService = {
    /**
     * Get all available countries from the backend proxy.
     * @returns {Promise<Array>} Array of formatted country objects
     */
    async getCountries() {
        if (countryCache.all) return countryCache.all;

        try {
        const response = await http.get(API_ENDPOINTS.COUNTRIES.LIST);
        
        // Handle standard backend response format: { data: [...], message: "..." }
        const countryList = response?.data || response || [];
        
        countryCache.all = countryList;
        return countryList;
        } catch (error) {
        console.error('[countryService] Failed to fetch countries:', error);
        throw error;
        }
    },

    /**
     * Fetch country flag and details by country name.
     * @param {string} countryName 
     * @returns {Promise<{flag: string, flagAlt: string} | null>}
     */
    async getCountryFlag(countryName) {
        if (!countryName) return null;
        
        const cacheKey = countryName.trim().toLowerCase();
        
        // Return from memory cache if available
        if (countryCache.flags[cacheKey]) {
        return countryCache.flags[cacheKey];
        }

        try {
        // Try to resolve from the 'all countries' cache if previously fetched
        if (countryCache.all) {
            const country = countryCache.all.find((entry) => entry.name.common.toLowerCase() === cacheKey);
            if (country) {
            const flagData = {
                flag: country.flags.svg || country.flags.png || country.flags.emoji,
                flagAlt: country.name.common,
            };
            countryCache.flags[cacheKey] = flagData;
            return flagData;
            }
        }

        // Fallback: Call the specific backend endpoint directly
        const response = await http.get(API_ENDPOINTS.COUNTRIES.FLAG(countryName));
        const flags = response?.data || response;

        if (!flags) return null;

        const flagData = {
            flag: flags.svg || flags.png || flags.emoji,
            flagAlt: countryName,
        };

        countryCache.flags[cacheKey] = flagData;
        return flagData;

        } catch (error) {
        console.warn(`[countryService] Failed to fetch flag for ${countryName}:`, error);
        return null;
        }
    },

    /**
     * Get country flag synchronously from cache.
     * Useful for immediate renders in mapped lists.
     */
    getCountryFlagSync(countryName) {
        if (!countryName) return null;
        return countryCache.flags[countryName.trim().toLowerCase()] || null;
    }
};