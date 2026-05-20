import { useState, useEffect } from "react";

/**
 * useCountries Hook
 * Fetches country data from REST Countries API
 * Returns array of countries with name and flag
 * Shared hook used across Register and Profile pages
 */
export const useCountries = () => {
    const [countries, setCountries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCountries = async () => {
            try {
                setLoading(true);
                const response = await fetch(
                    "https://restcountries.com/v3.1/all?fields=name,flags"
                );
                
                if (!response.ok) {
                    throw new Error(`Failed to fetch countries: ${response.statusText}`);
                }

                const data = await response.json();
                
                // Sort countries by name (common name or official name)
                const sortedCountries = data.sort((a, b) => {
                    const nameA = a.name.common || a.name.official;
                    const nameB = b.name.common || b.name.official;
                    return nameA.localeCompare(nameB);
                });

                setCountries(sortedCountries);
                setError(null);
            } catch (err) {
                console.error("Error fetching countries:", err);
                setError(err.message);
                // Fallback to empty array or default countries
                setCountries([]);
            } finally {
                setLoading(false);
            }
        };

        fetchCountries();
    }, []);

    return { countries, loading, error };
};
