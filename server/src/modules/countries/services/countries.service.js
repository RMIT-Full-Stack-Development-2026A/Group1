const APICOUNTRIES_BASE_URL = 'https://www.apicountries.com';

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

const fetchCountries = async () => {
    const response = await fetch(`${APICOUNTRIES_BASE_URL}/countries`, {
        headers: {
            Accept: 'application/json',
        },
    });

    if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        const message = errorBody?.message || response.statusText || 'Failed to load countries';
        throw {
            statusCode: response.status,
            error: 'COUNTRIES_FETCH_FAILED',
            message,
        };
    }

    const payload = await response.json();
    const countries = Array.isArray(payload) ? payload : payload?.data || [];

    return countries
        .map(parseCountry)
        .filter((country) => country.name.common)
        .sort((a, b) => a.name.common.localeCompare(b.name.common));
};

export const CountriesService = {
    async getCountries() {
        return await fetchCountries();
    },

    async getCountryFlag(countryName) {
        if (!countryName) {
            return null;
        }

        const countries = await fetchCountries();
        const country = countries.find(
            (entry) => entry.name.common.toLowerCase() === countryName.trim().toLowerCase()
        );

        if (!country) {
            return null;
        }

        return {
            flag: country.flags.svg || country.flags.png,
            flagAlt: country.name.common,
        };
    },
};