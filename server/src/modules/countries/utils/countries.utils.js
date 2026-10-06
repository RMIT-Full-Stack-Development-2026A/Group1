import { readFileSync } from 'node:fs';

// Keep a snapshot inside the server deployment root. Country selection must
// remain available when a third-party provider is blocked or unavailable.
const countriesData = JSON.parse(readFileSync(
    new URL('../data/countries.json', import.meta.url), 'utf8'
));

const countries = countriesData
    .map((country) => ({
        name: { common: country.name },
        flags: { ...country.flags, emoji: null },
    }))
    .sort((a, b) => a.name.common.localeCompare(b.name.common));

const fetchCountries = async () => countries;

export default fetchCountries;
