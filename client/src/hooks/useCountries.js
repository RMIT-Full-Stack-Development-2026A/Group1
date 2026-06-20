import { useState, useEffect } from "react";
import { countryService } from "../services/countryService";

/**
 * useCountries Hook
 * Returns country data from local JSON via countryService
 * Returns array of countries with name and flag
 * Shared hook used across Register and Profile pages
 */
export const useCountries = () => {
    const [countries, setCountries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        try {
            const data = countryService.getCountries();

            if (!data || data.length === 0) {
                throw new Error("Failed to load countries: no data available");
            }

            setCountries(data);
            setError(null);
        } catch (err) {
            console.error("Error loading countries:", err);
            setError(err.message);
            setCountries([]);
        } finally {
            setLoading(false);
        }
    }, []);

    return { countries, loading, error };
};
