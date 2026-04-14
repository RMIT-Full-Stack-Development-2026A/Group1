/**
 * Form Validation Utilities
 * Shared validation functions for email, username, and password
 * Used across Registration and Profile forms
 */

/**
 * Validate email format and criteria
 * @param {string} email - Email to validate
 * @returns {Object} - { hasAt, hasDot, validLength, noProhibited }
 */
export const validateEmail = (email) => {
    const atCount = (email.match(/@/g) || []).length;
    const hasAt = atCount === 1;
    const hasDot = hasAt && email.substring(email.indexOf("@")).includes(".");
    const validLength = email.length < 255;
    const prohibitedChars = /[\s();\:]/;
    const noProhibited = !prohibitedChars.test(email);

    return {
        hasAt,
        hasDot,
        validLength,
        noProhibited,
    };
};

/**
 * Validate username format and criteria
 * @param {string} username - Username to validate
 * @returns {Object} - { validChars, validLength }
 */
export const validateUsername = (username) => {
    const validChars = /^[a-zA-Z0-9_-]*$/.test(username);
    const validLength = username.length >= 6; // Minimum 6 chars
    return { validChars, validLength };
};

/**
 * Validate password strength criteria
 * Backend requires: 9+ chars, lowercase, uppercase, number, and special char (@$!%*?&)
 * @param {string} password - Password to validate
 * @returns {Object} - { hasLength, hasLower, hasNumber, hasSpecial, hasCapital }
 */
export const validatePassword = (password) => {
    return {
        hasLength: password.length >= 8, // Minimum 8 chars
        hasLower: /[a-z]/.test(password), // Must have lowercase
        hasNumber: /[0-9]/.test(password), // Must have digit
        hasSpecial: /[@$!%*?&]/.test(password), // Must have these specific special chars
        hasCapital: /[A-Z]/.test(password), // Must have uppercase
    };
};

/**
 * Check if all email validation criteria are met
 * @param {Object} emailValidation - Validation state object
 * @returns {boolean}
 */
export const isEmailValid = (emailValidation) => {
    return (
        emailValidation.hasAt &&
        emailValidation.hasDot &&
        emailValidation.validLength &&
        emailValidation.noProhibited
    );
};

/**
 * Check if all username validation criteria are met
 * @param {Object} usernameValidation - Validation state object
 * @returns {boolean}
 */
export const isUsernameValid = (usernameValidation) => {
    return usernameValidation.validChars && usernameValidation.validLength;
};

/**
 * Check if all password validation criteria are met
 * @param {Object} passwordValidation - Validation state object
 * @returns {boolean}
 */
export const isPasswordValid = (passwordValidation) => {
    return (
        passwordValidation.hasLength &&
        passwordValidation.hasLower &&
        passwordValidation.hasNumber &&
        passwordValidation.hasSpecial &&
        passwordValidation.hasCapital
    );
};

/**
 * Validate passwords match
 * @param {string} password - Main password
 * @param {string} confirmPassword - Confirmation password
 * @returns {boolean}
 */
export const passwordsMatch = (password, confirmPassword) => {
    return password === confirmPassword && password.length > 0;
};
