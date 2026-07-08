const APICOUNTRIES_BASE_URL = 'https://www.apicountries.com';

// Memory cache to prevent external API rate-limiting
let cachedCountries = null;
let lastFetchTime = 0;
const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours

/**
 * Parses external country data into the standard project format.
 * @param {Object} rawCountry - Raw data from external API.
 * @returns {Object} Formatted country data.
 */
const parseCountry = (rawCountry) => {
    const name = rawCountry?.name?.common || rawCountry?.name || '';

    return {
        name: {
            common: name,
        },
        flags: {
            svg: rawCountry?.flags?.svg || rawCountry?.flag || null,
            png: rawCountry?.flags?.png || null,
            emoji: rawCountry?.flags?.emoji || null,
        },
    };
};

/**
 * Fetches countries from external API with memory caching.
 * @returns {Promise<Array>} Array of formatted country objects.
 */
const fetchCountries = async () => {
    // Check if cached data is still valid
    if (cachedCountries && Date.now() - lastFetchTime < CACHE_TTL) {
        return cachedCountries;
    }

    const response = await fetch(`${APICOUNTRIES_BASE_URL}/countries`, {
        headers: {
            Accept: 'application/json',
        },
    });

    try {
        const response = await fetch(`${APICOUNTRIES_BASE_URL}/countries`, {
            headers: { Accept: 'application/json' },
        });

        if (!response.ok) {
            throw {
                statusCode: response.status,
                error: 'COUNTRIES_FETCH_FAILED',
                message: response.statusText || 'Failed to load countries from external provider.',
            };
        }

        const payload = await response.json();
        const countries = Array.isArray(payload) ? payload : payload?.data || [];

        // Parse, filter invalid, and sort alphabetically
        cachedCountries = countries
            .map(parseCountry)
            .filter((country) => country.name.common)
            .sort((a, b) => a.name.common.localeCompare(b.name.common));
        
        lastFetchTime = Date.now();
        return cachedCountries;
    } catch (error) {
        // Fallback to stale cache if the external API is temporarily down
        if (cachedCountries) return cachedCountries;
        throw error;
    }
};

export default fetchCountries;