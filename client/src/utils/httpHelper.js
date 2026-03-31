import axios from 'axios';

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
                if (error.response && error.response.status === 401) {
                    // Bắn một event toàn cục để AuthStore bắt được
                    window.dispatchEvent(new Event('auth:unauthorized'));
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