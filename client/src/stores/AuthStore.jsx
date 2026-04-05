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

            set({ isAuthenticated: true, user: response.data, isLoading: false });
            return response;
        } catch (error) {
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
            
            set({ isAuthenticated: true, user: response.data, isLoading: false });
            return response;
        } catch (error) {
            set({ error: error, isLoading: false });
            throw error;
        }
    },

    // Logout function
    logout: async () => {
        set({ isLoading: true, error: null });
        try {
            await authService.logout();
        } catch (error) {
            console.error("Logout API failed:", error);
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
            set({ isAuthenticated: true, user: response.data, isCheckingAuth: false });
        } catch (error) {
            console.log(error);
            // If API returns 401 (no token/cookie), set unauthenticated state
            set({ isAuthenticated: false, user: null, isCheckingAuth: false });
        }
    },

    // Clear error messages from state
    clearError: () => set({ error: null })
}));

// Listen for 401 unauthorized events dispatched from Axios interceptor
window.addEventListener('auth:unauthorized', () => {
    useAuthStore.getState().logout();
    window.location.href = '/login';
});