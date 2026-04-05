import { useEffect, useRef } from "react";
import { useAuthStore } from "@/stores/AuthStore";

/**
 * Custom hook for authentication logic
 * Delegates to global AuthStore to avoid duplicate state
 * 
 * @returns {Object} { isLoggedIn, loading, logout, checkAuth }
 */
export const useAuth = () => {
    const { isAuthenticated, isCheckingAuth, logout, checkAuth } = useAuthStore();
    const hasCheckedAuth = useRef(false);

    // Check auth on app startup (only once globally)
    useEffect(() => {
        if (!hasCheckedAuth.current) {
            hasCheckedAuth.current = true;
            checkAuth();
        }
    }, []); // Empty array - run only ONCE on app startup

    return {
        isLoggedIn: isAuthenticated,
        loading: isCheckingAuth,
        logout,
        checkAuth,
    };
};
