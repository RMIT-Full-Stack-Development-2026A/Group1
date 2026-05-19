import axios from 'axios';
import { useAuthStore } from '@/stores/auth/AuthStore';
import { notifyError } from '@/utils/toast.util';

/**
 * Custom Axios request config options supported by HttpHelper.
 * @property {boolean} [skipToast=false] - Prevent global error toasts for this request.
 * @property {boolean} [silent=false] - Prevent toast notifications for this request.
 */

class HttpHelper {
    constructor() {
        this.api = axios.create({
            baseURL: `${import.meta.env.VITE_API_URL}/api/v1`,
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
                    window.dispatchEvent(new Event('auth:unauthorized'));
                }
                
                const apiError = new Error(error.response?.data?.message || "An unexpected error occurred. Please try again.");
                apiError.response = error.response;
                apiError.status = error.response?.status;
                apiError.data = error.response?.data;
                apiError.config = error.config;
                
                return Promise.reject(apiError);
            }
        );

        this.api.interceptors.response.use(
            (response) => response,
            (error) => {
                const status = error?.response?.status ?? error?.status;
                const shouldSkipToast = error?.config?.silent === true || error?.config?.skipToast === true;

                if (status !== 401 && !shouldSkipToast) {
                    notifyError(error?.response?.data?.message || error?.message || "An unexpected error occurred. Please try again.");
                }

                return Promise.reject(error);
            }
        );
    }

    get(url, params = {}, config = {}) {
        return this.api.get(url, { params, ...config });
    }

    post(url, data, config = {}) {
        // If data is FormData, don't force JSON content-type
        // axios will automatically set multipart/form-data with correct boundary
        if (data instanceof FormData) {
            return this.api.post(url, data, {
                ...config,
                headers: {
                    ...(config.headers || {}),
                    'Content-Type': undefined, // Let browser/axios set it
                }
            });
        }
        return this.api.post(url, data, config);
    }

    put(url, data, config = {}) {
        return this.api.put(url, data, config);
    }

    patch(url, data, config = {}) {
        return this.api.patch(url, data, config);
    }

    delete(url, data = {}, config = {}) {
        return this.api.delete(url, { ...config, data });
    }
}

const http = new HttpHelper();
export default http;