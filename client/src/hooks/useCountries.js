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
        let isMounted = true; // Prevent state updates if unmounted

        const load = async () => {
            try {
                setLoading(true);
                const data = await countryService.getCountries();
                if (isMounted) {
                    setCountries(data || []);
                    setError(null);
                }
            } catch (err) {
                if (isMounted) {
                    console.error("Error loading countries:", err);
                    // Extract exact error message from backend if available
                    const errorMessage = err?.response?.data?.message || err.message || "Failed to load countries";
                    setError(errorMessage);
                    setCountries([]);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        load();

        return () => {
            isMounted = false; // Cleanup flag on unmount
        }
    }, []);

    return { countries, loading, error };
};
