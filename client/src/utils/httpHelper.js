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
        
        // Add a request interceptor to automatically attach the JWT token
        this.api.interceptors.request.use(
            (config) => {
                // Retrieve the token from localStorage
                const token = localStorage.getItem('jwt_token');
                
                // If token exists, attach it to the Authorization header using Bearer schema
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                
                return config;
            },
            (error) => {
                // Handle request errors before they are sent
                return Promise.reject(error);
            }
        );

        // Intercept responses to strip Axios wrappers and extract clean error messages
        this.api.interceptors.response.use(
            (response) => {
                return response.data;
            },
            (error) => {
                // Handle 401 Unauthorized globally (e.g., when token expires)
                if (error.response?.status === 401) {
                    console.warn("Unauthorized! Token might be invalid or expired.");
                    //Dispatch an event to tell AuthStore to log the user out
                    useAuthStore.getState().logout();
                    
                    // Force redirect to login page
                    window.location.href = '/login';
                }

                const message = error.response?.data?.message || "An unexpected error occurred. Please try again.";
                return Promise.reject(message);
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