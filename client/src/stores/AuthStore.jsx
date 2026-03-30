import { create } from 'zustand';
import http from '@/utils/httpHelper';

export const useAuthStore = create((set) => ({
    // 1. Initial State
    isAuthenticated: false,
    user: null,
    isCheckingAuth: true, 

    // 2. Actions to modify state when login, logout
    // and want to check if Authentication is still there or not
    checkAuth: async () => {
        set({ isCheckingAuth: true });

        console.log("AuthStore: checking authentication..."); // Testing log

        try {
            // Retrieve token from local storage
            const token = localStorage.getItem('jwt_token');

            // If no token, stop checking and set state to unauthenticated
            if (!token) {
                set({ isAuthenticated: false, user: null, isCheckingAuth: false });
                return;
            }

            // TODO: Replace with your actual endpoint, e.g., '/auth/me' or '/users/profile'
            const endpoint = 'YOUR_AUTH_ME_ENDPOINT_HERE'; 
            
            const response = await http.get(endpoint);

            // Assuming the backend returns the user object directly or nested like response.data.user
            //TODO: Update this based on your actual backend response structure
            const userData = response.user || response;

            set({ 
                isAuthenticated: true, 
                user: userData, 
                isCheckingAuth: false 
            });
        } catch (error) {
            console.error("AuthStore Error:", error);
            localStorage.removeItem('jwt_token');
            set({ isAuthenticated: false, user: null, isCheckingAuth: false });
        }
    },

    // Action to handle successful login from the UI
    login: (userData, token) => {
        localStorage.setItem('jwt_token', token);
        set({ isAuthenticated: true, user: userData });
        console.log("AuthStore: Login successful ->", userData);
    },

    logout: () => {
        // Clear storage and state
        localStorage.removeItem('jwt_token');
        set({ isAuthenticated: false, user: null });
        console.log("AuthStore: Logged out");
    }
}));