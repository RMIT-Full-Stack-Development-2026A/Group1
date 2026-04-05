import { useEffect } from "react";
import { useAuthStore } from "@/stores/AuthStore";

/**
 * Custom hook for authentication logic
 * Delegates to global AuthStore to avoid duplicate state
 * Calls checkAuth only once when app starts
 * 
 * @returns {Object} { isLoggedIn, loading, logout, checkAuth }
 */
export const useAuth = () => {
    const { isAuthenticated, isCheckingAuth, logout, checkAuth } = useAuthStore();

    // Trigger initial auth check when app starts
    useEffect(() => {
        checkAuth();
    }, []); // Empty array - checkAuth() guards itself to run only once globally

    return {
        isLoggedIn: isAuthenticated,
        loading: isCheckingAuth,
        logout,
        checkAuth,
    };
};
