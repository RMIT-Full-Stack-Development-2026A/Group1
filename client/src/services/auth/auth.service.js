import http from "../../utils/httpHelper";
import { API_ENDPOINTS } from "../../config/apiConfig";

export const authService = {
    // Call login API and save JWT token 
    login: async (credentials) => {
        const response = await http.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
        
        console.log('[Auth Service] Login response:', response);
        
        // Backend response: { data: userInfo, message: "..." }
        // Token is stored in httpOnly cookie by server (sent automatically with requests)
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
        
        // Backend response: { data: userInfo, message: "..." }
        // Token is stored in httpOnly cookie by server
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
        
        // Token is cleared by server (httpOnly cookie is removed)
        console.log('[Auth Service] Logout completed');
        
        return response;
    },

    // Call check-auth API to verify session
    checkAuth: async () => {
        return await http.get(API_ENDPOINTS.AUTH.CHECK_AUTH);
    },
};