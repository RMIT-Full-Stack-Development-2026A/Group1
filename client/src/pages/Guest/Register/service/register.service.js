/**
 * Register Service
 * Handles registration-related API calls and DTO creation
 */
    
import { authService } from "@/services/auth/auth.service";
import { RegisterRequest } from "@/pages/Guest/Login/model/auth";
import {
    isEmailValid,
    isUsernameValid,
    isPasswordValid,
    passwordsMatch,
} from "../utils/validationUtils";

export const registerService = {
    /**
     * Validate all registration fields
     * @param {Object} formData - { username, email, password, confirmPassword, country }
     * @param {Object} validationState - { emailValidation, usernameValidation, passwordValidation }
     * @returns {Object} - { isValid: boolean, errors: string[] }
     */
    validateRegisterForm: (formData, validationState) => {
        const errors = [];

        // Validate email
        if (!isEmailValid(validationState.emailValidation)) {
            errors.push("Email does not meet all requirements");
        }

        // Validate username
        if (formData.username.length === 0 || !isUsernameValid(validationState.usernameValidation)) {
            errors.push("Username must contain only letters, numbers, underscore, and hyphen");
        }

        // Validate password
        if (!isPasswordValid(validationState.passwordValidation)) {
            errors.push("Password does not meet all requirements");
        }

        // Check password match
        if (!passwordsMatch(formData.password, formData.confirmPassword)) {
            errors.push("Passwords must match");
        }

        return {
            isValid: errors.length === 0,
            errors,
        };
    },

    /**
     * Attempt user registration
     * @param {Object} formData - { username, email, password, confirmPassword, country }
     * @param {Object} validationState - Validation states for all fields
     * @returns {Promise<Object>} - Response from auth API
     * @throws {Object} - Error object with message
     */
    attemptRegister: async (formData, validationState) => {
        try {
            // Validate form first
            const validation = registerService.validateRegisterForm(formData, validationState);
            if (!validation.isValid) {
                throw {
                    statusCode: 400,
                    message: validation.errors.join("\n"),
                    details: validation.errors,
                };
            }

            // Create RegisterRequest DTO
            const registerRequest = new RegisterRequest(formData);

            // Call auth service
            const response = await authService.register(registerRequest.toJSON());
            return response;
        } catch (error) {
            // Re-throw with proper format
            throw {
                statusCode: error.statusCode || 500,
                message: error.message || "Registration failed. Please try again.",
                details: error.details,
            };
        }
    },
};
