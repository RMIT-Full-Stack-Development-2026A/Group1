import countriesData from "../data/countries.json";

/**
 * Country Service - Provides country data including flags from local JSON
 * No external API calls needed
 */

let countriesCache = null;

const getFlag = (countryName) => {
    if (!countryName || !countriesCache) return null;

    const country = countriesCache.find(
        (c) => c.name.common.toLowerCase() === countryName.toLowerCase()
    );

    if (!country) return null;

    return {
        flag: country.flags.svg || country.flags.png,
        flagAlt: country.name.common,
    };
};

export const countryService = {
    /**
     * Get country flag by country name
     * @param {string} countryName - Country name (e.g., "Algeria", "United States")
     * @returns {{flag: string, flagAlt: string} | null} Flag URL and alt text, or null if not found
     */
    getCountryFlag(countryName) {
        // Ensure data is loaded
        if (!countriesCache) {
        this.getCountries();
        }
        return getFlag(countryName);
    },

        /**
     * Alias for getCountryFlag — kept for backward compatibility
     */
    getCountryFlagAsync(countryName) {
        return this.getCountryFlag(countryName);
    },

    /**
     * Get all available countries from local data
     * Returns data in format for CountrySelect component: {name: {common: string}, flags: {svg, png}}
     * @returns {Array} Array of country objects with name and flags
     */
    getCountries() {
        if (countriesCache) return countriesCache;

        countriesCache = countriesData.map((c) => ({
        name: { common: c.name },
        flags: c.flags,
        }));

        return countriesCache;
    },

    /**
     * Clear cache (useful for testing)
     */
    clearCache() {
        countriesCache = null;
    },
};