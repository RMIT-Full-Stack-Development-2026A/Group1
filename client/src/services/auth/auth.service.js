import http from '../../utils/httpHelper';

import { API_ENDPOINTS } from '../../config/apiConfig.js'

export const authService = {
    // Call login API
    login: async (credentials) => {
        return await http.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
    },

    // Call register API
    register: async (userData) => {
        return await http.post(API_ENDPOINTS.AUTH.REGISTER, userData);
    },

    // Call logout API
    logout: async () => {
        return await http.post(API_ENDPOINTS.AUTH.LOGOUT);
    },

    // Call check-auth API to verify session
    checkAuth: async () => {
        return await http.get(API_ENDPOINTS.AUTH.CHECK_AUTH);
    }
};