/**
 * Login Service
 * Handles login-related API calls
 */

import { authService } from "@/services/auth/auth.service";
import { LoginRequest } from "@/models/auth";

export const loginService = {
    /**
     * Attempt login with credentials
     * @param {Object} credentials - { email, password }
     * @returns {Promise<Object>} - Response from auth API
     * @throws {Object} - Error object with statusCode and message
     */
    attemptLogin: async (credentials) => {
        try {
            // Create LoginRequest DTO
            const loginRequest = new LoginRequest(credentials);

            // Validate request
            const validation = loginRequest.validate();
            if (!validation.valid) {
                throw {
                    statusCode: 400,
                    message: validation.errors.join(", "),
                };
            }

            // Call auth service
            const response = await authService.login(loginRequest.toJSON());
            return response;
        } catch (error) {
            // Re-throw with proper format
            throw {
                statusCode: error.statusCode || 500,
                message: error.message || "Login failed. Please try again.",
            };
        }
    },

    /**
     * Handle guest login navigation
     * This is a placeholder for future guest session logic
     */
    guestLogin: async () => {
        // TODO: Implement when guest session API is ready
        return { success: true };
    },
};
