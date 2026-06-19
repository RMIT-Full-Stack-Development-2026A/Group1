import fetchCountries from '../utils/countries.utils.js';

export const CountriesService = {
    // [GET] /countries endpoint
    async getCountries() {
        return await fetchCountries();
    },

    // [GET] /countries/:name/flag endpoint
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