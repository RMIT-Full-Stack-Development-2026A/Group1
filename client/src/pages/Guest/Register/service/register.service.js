/**
 * Register Service
 * Handles registration-related API calls and DTO creation
 */

import { RegisterRequest } from "@/pages/Guest/Login/model/auth";
import {
    isEmailValid,
    isUsernameValid,
    isPasswordValid,
    passwordsMatch,
} from "@/utils/formValidation";

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

};
