import { create } from 'zustand';
import { authService } from "../services/auth/auth.service";
import { getStoredToken, extractUserIdentity } from '../utils/jwtUtils';

// Global flag to ensure checkAuth is only called once per app lifecycle
let hasInitializedAuth = false;

export const useAuthStore = create((set) => ({
    user: null,
    isAuthenticated: false,
    isCheckingAuth: true, // loading state on initial load
    isLoading: false,     // loading state for button clicks (login/register)
    error: null,

    // Login function
    login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
            // Delegate the API call to the service layer
            // authService.login() already extracts user identity from JWT
            const response = await authService.login(credentials);
            const userIdentity = response.user; // Extracted in authService
            console.log('[Auth] Login successful:', userIdentity);

            set({ isAuthenticated: true, user: userIdentity, isLoading: false, isCheckingAuth: false });
            
            // Allow checkAuth to run again on next page/route to verify backend session
            hasInitializedAuth = false;
            
            return response;
        } catch (error) {
            console.error('[Auth] Login failed:', error);
            set({ error: error, isLoading: false, isCheckingAuth: false });
            throw error;
        }
    },

    // Register function
    register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
            // Delegate the API call to the service layer
            // authService.register() already extracts user identity from JWT
            const response = await authService.register(userData);
            const userIdentity = response.user; // Extracted in authService
            console.log('[Auth] Register successful:', userIdentity);
            
            set({ isAuthenticated: true, user: userIdentity, isLoading: false, isCheckingAuth: false });
            
            // Allow checkAuth to run again on next page/route to verify backend session
            hasInitializedAuth = false;
            
            return response;
        } catch (error) {
            console.error('[Auth] Register failed:', error);
            set({ error: error, isLoading: false, isCheckingAuth: false });
            throw error;
        }
    },

    // Logout function
    logout: async () => {
        set({ isLoading: true, error: null });
        try {
            await authService.logout();
            console.log('[Auth] Logout completed');
            hasInitializedAuth = false; // Reset for next app session
        } catch (error) {
            console.debug('[Auth] Logout API failed (expected if no token):', error);
            // Silently ignore logout API errors (e.g., 401 when already logged out)
            // The frontend state will be cleared regardless
        } finally {
            // Always clear state on the frontend regardless of API success/failure
            set({ isAuthenticated: false, user: null, isLoading: false });
        }
    },

    // Check session/cookie after reloading - ONLY CALL ONCE PER APP LIFECYCLE
    checkAuth: async () => {
        // Prevent duplicate calls - use global flag not component-scoped
        if (hasInitializedAuth) {
            console.log('[Auth] checkAuth already called, skipping duplicate');
            return;
        }
        
        hasInitializedAuth = true;
        set({ isCheckingAuth: true, error: null });
        
        try {
            const token = getStoredToken();
            console.log('[Auth] checkAuth: token exists?', !!token);
            
            // If no token, skip the backend check (user is not logged in)
            if (!token) {
                console.log('[Auth] No token found, user not authenticated');
                set({ isAuthenticated: false, user: null, isCheckingAuth: false });
                return;
            }
            
            // Only call backend if we have a token
            // Add timeout to prevent indefinite hanging
            const checkAuthPromise = authService.checkAuth();
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('checkAuth timeout')), 5000)
            );
            
            const response = await Promise.race([checkAuthPromise, timeoutPromise]);
            
            // After backend verifies JWT is valid, extract user identity from JWT payload
            const userIdentity = extractUserIdentity(token);
            console.log('[Auth] checkAuth succeeded. User from JWT:', userIdentity);
            set({ isAuthenticated: true, user: userIdentity, isCheckingAuth: false });
            
        } catch (error) {
            console.debug('[Auth] checkAuth failed:', error.message);
            
            // If checkAuth fails but we have a valid token, treat user as authenticated
            // (backend might be slow or unreachable, but token is still valid)
            const token = getStoredToken();
            if (token) {
                const userIdentity = extractUserIdentity(token);
                if (userIdentity) {
                    console.log('[Auth] Token exists and valid, authenticating user despite checkAuth failure');
                    set({ isAuthenticated: true, user: userIdentity, isCheckingAuth: false });
                    return;
                }
            }
            
            // If no valid token or extraction failed, user is not authenticated
            set({ isAuthenticated: false, user: null, isCheckingAuth: false });
        }
    },

    // Clear error messages from state
    clearError: () => set({ error: null })
}));

// Listen for 401 unauthorized events dispatched from Axios interceptor
window.addEventListener('auth:unauthorized', () => {
    useAuthStore.getState().logout();
    // Don't use window.location - let React Router handle redirects via ProtectedRoute
});