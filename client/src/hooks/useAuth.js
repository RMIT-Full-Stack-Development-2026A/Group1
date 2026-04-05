import { useState, useEffect, useCallback } from "react";
import { authService } from "@/services/auth/auth.service";

/**
 * Custom hook for authentication logic
 * Manages auth state and provides login/logout/checkAuth methods
 * 
 * @returns {Object} { isLoggedIn, loading, logout, checkAuth }
 */
export const useAuth = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);

    // Check authentication status
    const checkAuth = useCallback(async () => {
        try {
            const response = await authService.checkAuth();
            if (response && response.data && response.data.data) {
                setIsLoggedIn(true);
                return true;
            } else {
                setIsLoggedIn(false);
                return false;
            }
        } catch (error) {
            // 401 is expected when user is not logged in - don't log it as an error
            if (error.message && error.message.includes("No token provided")) {
                setIsLoggedIn(false);
                return false;
            }
            console.error("Auth check failed:", error);
            setIsLoggedIn(false);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    // Check auth on component mount
    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    // Logout handler
    const logout = useCallback(async () => {
        try {
            await authService.logout();
            setIsLoggedIn(false);
            return true;
        } catch (error) {
            console.error("Logout failed:", error);
            return false;
        }
    }, []);

    return {
        isLoggedIn,
        loading,
        logout,
        checkAuth,
    };
};
