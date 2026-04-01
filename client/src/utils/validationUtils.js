/**
 * Validation Utilities
 * Shared validation functions for email, username, and password
 * Used across Register, Login, and other auth-related pages
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
 * @returns {Object} - { validChars }
 */
export const validateUsername = (username) => {
    const validChars = /^[a-zA-Z0-9_-]*$/.test(username);
    return { validChars };
};

/**
 * Validate password strength criteria
 * @param {string} password - Password to validate
 * @returns {Object} - { hasLength, hasNumber, hasSpecial, hasCapital }
 */
export const validatePassword = (password) => {
    return {
        hasLength: password.length >= 8,
        hasNumber: /[0-9]/.test(password),
        hasSpecial: /[^A-Za-z0-9]/.test(password),
        hasCapital: /[A-Z]/.test(password),
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
    return usernameValidation.validChars;
};

/**
 * Check if all password validation criteria are met
 * @param {Object} passwordValidation - Validation state object
 * @returns {boolean}
 */
export const isPasswordValid = (passwordValidation) => {
    return (
        passwordValidation.hasLength &&
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
