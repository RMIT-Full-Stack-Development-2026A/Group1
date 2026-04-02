import { API_BASE_URL, API_ENDPOINTS } from "@/config/apiConfig";

/**
 * Auth Service
 * Handles authentication with backend using fetch API and HttpOnly cookies
 * Cookies are automatically sent/received by browser
 */
export const authService = {
    /**
     * Register new user
     * @param {Object} userData - { username, email, password, confirmPassword, country }
     * @returns {Promise<Object>} - Backend response with user data
     */
    register: async (userData) => {
        try {
            const response = await fetch(
                `${API_BASE_URL}${API_ENDPOINTS.AUTH.REGISTER}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include", // Important: send/receive cookies
                    body: JSON.stringify(userData),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                // Backend returns validation errors in details
                const error = new Error(data.message || "Registration failed");
                error.statusCode = response.status;
                error.details = data.details || null;
                throw error;
            }

            return { success: true, data };
        } catch (error) {
            console.error("Register error:", error);
            throw error;
        }
    },

    /**
     * Login user
     * @param {Object} loginData - { identifier (email/username), password }
     * @returns {Promise<Object>} - Backend response with user data
     */
    login: async (loginData) => {
        try {
            const response = await fetch(
                `${API_BASE_URL}${API_ENDPOINTS.AUTH.LOGIN}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include", // Important: send/receive cookies
                    body: JSON.stringify(loginData),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                const error = new Error(data.message || "Login failed");
                error.statusCode = response.status;
                error.errorCode = data.error || null;
                error.details = data.details || null;
                throw error;
            }

            return { success: true, data };
        } catch (error) {
            console.error("Login error:", error);
            throw error;
        }
    },

    /**
     * Check if user is authenticated
     * Backend checks the HttpOnly cookie automatically
     * @returns {Promise<Object>} - User data if authenticated
     */
    checkAuth: async () => {
        try {
            const response = await fetch(
                `${API_BASE_URL}${API_ENDPOINTS.AUTH.CHECK_AUTH}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include", // Send cookie for verification
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Not authenticated");
            }

            return { authenticated: true, data };
        } catch (error) {
            console.error("Auth check error:", error);
            return { authenticated: false, error };
        }
    },

    /**
     * Logout user
     * Clears HttpOnly cookie on backend
     * @returns {Promise<Object>} - Logout confirmation
     */
    logout: async () => {
        try {
            const response = await fetch(
                `${API_BASE_URL}${API_ENDPOINTS.AUTH.LOGOUT}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include", // Send cookie for logout
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Logout failed");
            }

            return { success: true, data };
        } catch (error) {
            console.error("Logout error:", error);
            throw error;
        }
    },
};
