import { useState, useEffect } from "react";
import { countryService } from "../services/countryService";

/**
 * useCountries Hook
 * Fetches country data from the backend countries endpoint
 * Returns array of countries with name and flag
 * Shared hook used across Register and Profile pages
 */
export const useCountries = () => {
    const [countries, setCountries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const data = await countryService.getCountries();
                setCountries(data || []);
                setError(null);
            } catch (err) {
                console.error("Error loading countries via countryService:", err);
                setError(err.message || "Failed to load countries");
                setCountries([]);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);

    return { countries, loading, error };
};
