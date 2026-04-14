import axios from 'axios';
import { useAuthStore } from '@/stores/AuthStore';

class HttpHelper {
    constructor() {
        this.api = axios.create({
            baseURL: import.meta.env.MODE === "development" ? "http://localhost:5000/api/v1" : "/api/v1",
            timeout: 10000,
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Intercept responses to strip Axios wrappers and extract clean error messages
        this.api.interceptors.response.use(
            (response) => {
                return response.data;
            },
            (error) => {
                // Debug logging for non-expected errors
                if (error.response && error.response.status === 401) {
                    const isLogoutRequest = error.config.url.includes('/logout');
                    const isCheckAuthRequest = error.config.url.includes('/check-auth');
                    
                    // Log 401 for check-auth and logout as expected behavior
                    if (isCheckAuthRequest || isLogoutRequest) {
                        console.debug(`[Auth] 401 ${isCheckAuthRequest ? 'check-auth' : 'logout'} - Expected (no token)`);
                    } else {
                        console.warn(`[API] 401 Unauthorized on ${error.config.method.toUpperCase()} ${error.config.url}`);
                        window.dispatchEvent(new Event('auth:unauthorized'));
                    }
                } else if (error.response && error.response.status >= 400) {
                    // Log other 4xx/5xx errors
                    console.error(`[API] ${error.response.status} ${error.config.method.toUpperCase()} ${error.config.url}:`, error.response.data);
                } else if (error.request) {
                    // Network error
                    console.error('[Network Error]:', error.message);
                }
                
                // Create error object with response structure preserved for frontend error handling
                const apiError = new Error(error.response?.data?.message || "An unexpected error occurred. Please try again.");
                apiError.response = error.response; // Preserve full response for downstream handlers
                apiError.status = error.response?.status;
                apiError.data = error.response?.data;
                
                return Promise.reject(apiError);
            }
        );
    }

    get(url, params = {}) {
        return this.api.get(url, { params });
    }

    post(url, data) {
        return this.api.post(url, data);
    }

    put(url, data) {
        return this.api.put(url, data);
    }

    patch(url, data) {
        return this.api.patch(url, data);
    }

    delete(url, data = {}) {
        return this.api.delete(url, { data });
    }
}

const http = new HttpHelper();
export default http;