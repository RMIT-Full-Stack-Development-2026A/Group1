/**
 * Authentication DTOs (Data Transfer Objects)
 * 
 * These objects define the structure and validation for authentication-related API requests and responses.
 * Using DTOs ensures consistency between frontend and backend.
 * 
 * @file src/models/auth.js
 */

/**
 * LoginRequest DTO
 * Used for POST /auth/login endpoint
 */
export class LoginRequest {
  /**
   * @param {Object} data - Raw form data
   * @param {string} data.email - User email
   * @param {string} data.password - User password
   */
  constructor(data = {}) {
    this.email = (data.email || "").trim().toLowerCase();
    this.password = data.password || "";
  }

  /**
   * Validate LoginRequest fields
   * @returns {Object} Validation result with valid flag and errors array
   */
  validate() {
    const errors = [];

    if (!this.email) {
      errors.push("Email is required");
    } else if (!this.email.includes("@")) {
      errors.push("Email must contain @");
    }

    if (!this.password) {
      errors.push("Password is required");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Convert to JSON for API submission
   * @returns {Object} JSON representation
   */
  toJSON() {
    return {
      email: this.email,
      password: this.password,
    };
  }
}

/**
 * RegisterRequest DTO
 * Used for POST /auth/register endpoint
 */
export class RegisterRequest {
  /**
   * @param {Object} data - Raw form data
   * @param {string} data.username - Username
   * @param {string} data.email - Email address
   * @param {string} data.password - Password
   * @param {string} data.country - Country name
   */
  constructor(data = {}) {
    this.username = (data.username || "").trim();
    this.email = (data.email || "").trim().toLowerCase();
    this.password = data.password || "";
    this.country = data.country || "Vietnam";
  }

  /**
   * Validate RegisterRequest fields
   * @returns {Object} Validation result with valid flag and errors array
   */
  validate() {
    const errors = [];

    if (!this.username) {
      errors.push("Username is required");
    } else if (!/^[a-zA-Z0-9_-]+$/.test(this.username)) {
      errors.push("Username must contain only letters, numbers, underscore, and hyphen");
    }

    if (!this.email) {
      errors.push("Email is required");
    } else if (!this.email.includes("@") || !this.email.includes(".")) {
      errors.push("Email must be valid format");
    }

    if (!this.password) {
      errors.push("Password is required");
    } else if (this.password.length < 8) {
      errors.push("Password must be at least 8 characters");
    }

    if (!this.country) {
      errors.push("Country is required");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Convert to JSON for API submission
   * @returns {Object} JSON representation
   */
  toJSON() {
    return {
      username: this.username,
      email: this.email,
      password: this.password,
      country: this.country,
    };
  }
}

/**
 * AuthResponse DTO
 * Response structure from login/register endpoints
 */
export class AuthResponse {
  /**
   * @param {Object} data - Response data from API
   * @param {boolean} data.success - Whether request succeeded
   * @param {Object} data.data - Response data
   * @param {Object} data.data.token - JWT token (if applicable)
   * @param {Object} data.data.user - User object
   * @param {string} data.message - Error message (if failed)
   */
  constructor(data = {}) {
    this.success = data.success || false;
    this.data = data.data || null;
    this.message = data.message || "";
    this.token = data.data?.token || null;
    this.user = data.data?.user || null;
  }

  /**
   * Check if response is successful
   * @returns {boolean} True if success
   */
  isSuccess() {
    return this.success && !!this.token;
  }

  /**
   * Check if response has error
   * @returns {boolean} True if error
   */
  hasError() {
    return !this.success || !!this.message;
  }

  /**
   * Get error message
   * @returns {string} Error message
   */
  getErrorMessage() {
    return this.message || "An unexpected error occurred";
  }

  /**
   * Get user from response
   * @returns {Object|null} User object or null
   */
  getUser() {
    return this.user || null;
  }

  /**
   * Get token from response
   * @returns {string|null} JWT token or null
   */
  getToken() {
    return this.token || null;
  }
}

/**
 * LoginResponse DTO
 * Extended AuthResponse for login-specific handling
 */
export class LoginResponse extends AuthResponse {
  constructor(data = {}) {
    super(data);
    this.attemptsRemaining = data.attemptsRemaining || null;
    this.isLocked = data.isLocked || false;
  }

  /**
   * Check if account is locked after login attempt
   * @returns {boolean} True if locked
   */
  getIsLocked() {
    return this.isLocked;
  }

  /**
   * Get remaining login attempts
   * @returns {number|null} Remaining attempts or null
   */
  getAttemptsRemaining() {
    return this.attemptsRemaining;
  }
}

/**
 * RegisterResponse DTO
 * Extended AuthResponse for register-specific handling
 */
export class RegisterResponse extends AuthResponse {
  constructor(data = {}) {
    super(data);
    this.verificationCodeSent = data.verificationCodeSent || false;
  }

  /**
   * Check if verification code was sent
   * @returns {boolean} True if sent
   */
  getVerificationCodeSent() {
    return this.verificationCodeSent;
  }
}
