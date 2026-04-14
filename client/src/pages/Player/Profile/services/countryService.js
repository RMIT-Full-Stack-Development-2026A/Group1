// Country Service - Fetch country data including flags from REST Countries API
// Caches results to reduce API calls

const countryCache = {};

export const countryService = {
  /**
   * Fetch country flag and details by country name
   * @param {string} countryName - Country name (e.g., "Algeria", "United States")
   * @returns {Promise<{flag: string, flagAlt: string} | null>} Flag emoji/URL or null if not found
   */
  async getCountryFlag(countryName) {
    if (!countryName) return null;

    // Return from cache if available
    if (countryCache[countryName]) {
      return countryCache[countryName];
    }

    try {
      const response = await fetch('https://restcountries.com/v3.1/all?fields=name,flags');
      const countries = await response.json();

      // Find matching country by common name
      const country = countries.find(
        (c) => c.name.common.toLowerCase() === countryName.toLowerCase()
      );

      if (country) {
        const flagData = {
          flag: country.flags.svg || country.flags.png,
          flagAlt: country.name.common,
        };
        // Cache the result
        countryCache[countryName] = flagData;
        return flagData;
      }

      return null;
    } catch (error) {
      console.warn(`[countryService] Failed to fetch flag for ${countryName}:`, error);
      return null;
    }
  },

  /**
   * Get country flag synchronously from cache (if available)
   * Useful for rendering after initial load
   */
  getCountryFlagSync(countryName) {
    return countryCache[countryName] || null;
  },

  /**
   * Get all available countries from REST Countries API with flags and caching
   * Returns data in format for CountrySelect component: {name: {common: string}, flags: {svg, png}}
   * @returns {Promise<Array>} Array of country objects with name.common and flags
   */
  async getCountries() {
    // Return from cache if available
    if (countryCache['__ALL__']) {
      return countryCache['__ALL__'];
    }

    try {
      const response = await fetch('https://restcountries.com/v3.1/all?fields=name,flags');
      const countries = await response.json();

      const countryList = countries
        .map((c) => ({
          name: { common: c.name.common },
          flags: c.flags,
        }))
        .sort((a, b) => a.name.common.localeCompare(b.name.common));

      // Cache the result
      countryCache['__ALL__'] = countryList;
      return countryList;
    } catch (error) {
      console.warn('[countryService] Failed to fetch countries list:', error);
      return [];
    }
  },

  /**
   * Clear country cache (useful for testing)
   */
  clearCache() {
    Object.keys(countryCache).forEach((key) => delete countryCache[key]);
  },
};
