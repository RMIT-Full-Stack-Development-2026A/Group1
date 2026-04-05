/**
 * Custom hook for landing page logic
 * Manages navigation between landing, login, and registration
 * Redirects authenticated users to lobby
 */

import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/AuthStore";

export const useLanding = () => {
    const navigate = useNavigate();
    const { isAuthenticated, isCheckingAuth } = useAuthStore();

    // Redirect to lobby if already authenticated
    useEffect(() => {
        if (!isCheckingAuth && isAuthenticated) {
            console.log('[Landing] User already authenticated, redirecting to /lobby');
            navigate("/lobby", { replace: true });
        }
    }, [isAuthenticated, isCheckingAuth, navigate]);

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
