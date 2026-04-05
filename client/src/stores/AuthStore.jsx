import { create } from 'zustand';
import { authService } from "../services/auth/auth.service";

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
            const response = await authService.login(credentials);
            console.log('[Auth] Login successful:', response.data);

            set({ isAuthenticated: true, user: response.data, isLoading: false });
            return response;
        } catch (error) {
            console.error('[Auth] Login failed:', error);
            set({ error: error, isLoading: false });
            throw error;
        }
    },

    // Register function
    register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
            // Delegate the API call to the service layer
            const response = await authService.register(userData);
            console.log('[Auth] Register successful:', response.data);
            
            set({ isAuthenticated: true, user: response.data, isLoading: false });
            return response;
        } catch (error) {
            console.error('[Auth] Register failed:', error);
            set({ error: error, isLoading: false });
            throw error;
        }
    },

    // Logout function
    logout: async () => {
        set({ isLoading: true, error: null });
        try {
            await authService.logout();
            console.log('[Auth] Logout completed');
        } catch (error) {
            console.debug('[Auth] Logout API failed (expected if no token):', error);
            // Silently ignore logout API errors (e.g., 401 when already logged out)
            // The frontend state will be cleared regardless
        } finally {
            // Always clear state on the frontend regardless of API success/failure
            set({ isAuthenticated: false, user: null, isLoading: false });
        }
    },

    // Check session/cookie after reloading
    checkAuth: async () => {
        set({ isCheckingAuth: true, error: null });
        try {
            const response = await authService.checkAuth();
            console.log('[Auth] checkAuth succeeded:', response.data);
            set({ isAuthenticated: true, user: response.data, isCheckingAuth: false });
        } catch (error) {
            console.debug('[Auth] checkAuth failed (expected if no token):', error);
            // Silently handle auth check failures (not logged in is normal state)
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