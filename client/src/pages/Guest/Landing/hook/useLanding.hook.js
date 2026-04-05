/**
 * Custom hook for landing page logic
 * Manages navigation between landing, login, and registration
 */

import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

export const useLanding = () => {
    const navigate = useNavigate();

    // Navigate to registration page
    const handlePlayNow = useCallback(() => {
        navigate("/register");
    }, [navigate]);

    // Navigate to login page
    const handleLogin = useCallback(() => {
        navigate("/login");
    }, [navigate]);

    return {
        handlePlayNow,
        handleLogin,
    };
};
