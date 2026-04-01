import { create } from 'zustand';
import http from '../utils/httpHelper';
import { API_ENDPOINTS } from '../config/apiConfig';


    // { data: <user object>, message: ... }

export const useAuthStore = create((set) => ({
    user: null,
    isAuthenticated: false,
    isCheckingAuth: true, // loading state
    isLoading: false,
    error: null,

    // login function
    login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
            const response = await http.post(API_ENDPOINTS.AUTH.LOGIN, credentials);

            set({ isAuthenticated: true, user: response.data, isLoading: false });
            return response;
        } catch (error) {
            set({ error: error, isLoading: false });
            throw error;
        }
    },

    // 2. register function
    register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await http.post(API_ENDPOINTS.AUTH.REGISTER, userData);
            set({ isAuthenticated: true, user: response.data, isLoading: false });
            return response;
        } catch (error) {
            set({ error: error, isLoading: false });
            throw error;
        }
    },

    // logout
    logout: async () => {
        set({ isLoading: true, error: null });
        try {
            await http.post(API_ENDPOINTS.AUTH.LOGOUT);
        } catch (error) {
            console.error("Logout API failed:", error);
        } finally {
            // Dù API gọi fail hay success, FE vẫn phải clear state
            set({ isAuthenticated: false, user: null, isLoading: false });
        }
    },

    // check cookie after reloading
    checkAuth: async () => {
        set({ isCheckingAuth: true, error: null });
        try {
            const response = await http.get(API_ENDPOINTS.AUTH.CHECK_AUTH);
            set({ isAuthenticated: true, user: response.data, isCheckingAuth: false });
        } catch (error) {
            // Nếu API báo lỗi 401 (chưa có token), set state về false
            set({ isAuthenticated: false, user: null, isCheckingAuth: false });
        }
    },

    clearError: () => set({ error: null })
}));

// 401 token expiration from axios 
window.addEventListener('auth:unauthorized', () => {
    useAuthStore.getState().logout();
    window.location.href = '/login';
});