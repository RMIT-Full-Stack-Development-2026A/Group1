import http from "../../utils/httpHelper";
import { API_ENDPOINTS } from "../../config/apiConfig";
import { saveToken, clearToken, extractUserIdentity } from "../../utils/jwtUtils";

export const authService = {
    // Call login API and save JWT token 
    login: async (credentials) => {
        const response = await http.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
        
        console.log('[Auth Service] Login response:', response);
        
        // Backend response: { data: userInfo, token: jwt, message: "..." }
        // Extract JWT token from response and save to localStorage
        const token = response.token;
        console.log('[Auth Service] Extracted token from response:', !!token);
        
        if (token) {
            saveToken(token);
            console.log('[JWT] Token saved to localStorage');
        }
        
        // Extract user identity from response.data (full user info from backend)
        const userIdentity = response.data ? {
            id: response.data.id,
            email: response.data.email,
            username: response.data.username,
            role: response.data.role || 'PLAYER',
            isPremium: response.data.isPremium || false,
            avatar: response.data.avatar,
            country: response.data.country,
        } : null;
        
        console.log('[Auth Service] User identity extracted from response:', userIdentity);
        
        // Return response with user identity
        return { 
            ...response, 
            user: userIdentity 
        };
    },

    // Call register API and save JWT token 
    register: async (userData) => {
        const response = await http.post(API_ENDPOINTS.AUTH.REGISTER, userData);
        
        console.log('[Auth Service] Register response:', response);
        
        // Backend response: { data: userInfo, token: jwt, message: "..." }
        // Extract JWT token from response and save to localStorage
        const token = response.token;
        console.log('[Auth Service] Extracted token from response:', !!token);
        
        if (token) {
            saveToken(token);
            console.log('[JWT] Token saved to localStorage');
        }
        
        // Extract user identity from response.data (full user info from backend)
        const userIdentity = response.data ? {
            id: response.data.id,
            email: response.data.email,
            username: response.data.username,
            role: response.data.role || 'PLAYER',
            isPremium: response.data.isPremium || false,
            avatar: response.data.avatar,
            country: response.data.country,
        } : null;
        
        console.log('[Auth Service] User identity extracted from response:', userIdentity);
        
        return { 
            ...response, 
            user: userIdentity 
        };
    },

    // Call logout API and clear JWT token
    logout: async () => {
        const response = await http.post(API_ENDPOINTS.AUTH.LOGOUT);
        
        // Clear JWT token from localStorage
        clearToken();
        
        return response;
    },

    // Call check-auth API to verify session
    checkAuth: async () => {
        return await http.get(API_ENDPOINTS.AUTH.CHECK_AUTH);
    }
};