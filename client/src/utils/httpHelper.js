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
                // Skip global logout for password validation errors (401 from password change)
                const skipGlobalAuthError = error.config?.skipGlobalAuthError;
                
                if (error.response && error.response.status === 401 && !skipGlobalAuthError) {
                    console.log("[httpHelper] 401 Unauthorized - dispatching auth:unauthorized event");
                    window.dispatchEvent(new Event('auth:unauthorized'));
                }
                
                const apiError = new Error(error.response?.data?.message || "An unexpected error occurred. Please try again.");
                apiError.response = error.response;
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
        // If data is FormData, don't force JSON content-type
        // axios will automatically set multipart/form-data with correct boundary
        if (data instanceof FormData) {
            return this.api.post(url, data, {
                headers: {
                    'Content-Type': undefined, // Let browser/axios set it
                }
            });
        }
        return this.api.post(url, data);
    }

    put(url, data) {
        return this.api.put(url, data);
    }

    patch(url, data, config = {}) {
        return this.api.patch(url, data, config);
    }

    delete(url, data = {}) {
        return this.api.delete(url, { data });
    }
}

const http = new HttpHelper();
export default http;