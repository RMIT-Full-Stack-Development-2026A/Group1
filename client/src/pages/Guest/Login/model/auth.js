/**
 * Authentication DTOs (Data Transfer Objects)
 * 
 * These objects define the structure and validation for authentication-related API requests.
 * Using DTOs ensures consistency between frontend and backend.
 */

/**
 * LoginRequest DTO
 * Used for POST /auth/login endpoint
 */
export class LoginRequest {
  /**
   * @param {Object} data - Raw form data
   * @param {string} data.email - User email (will be converted to identifier)
   * @param {string} data.password - User password
   */
  constructor(data = {}) {
    // Backend expects 'identifier' which can be email or username
    this.identifier = (data.email || data.identifier || "").trim().toLowerCase();
    this.password = data.password || "";
  }

  /**
   * Validate LoginRequest fields
   * @returns {Object} Validation result with valid flag and errors array
   */
  validate() {
    const errors = [];

    if (!this.identifier) {
      errors.push("Email or username is required");
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
   * @returns {Object} JSON representation with 'identifier' field
   */
  toJSON() {
    return {
      identifier: this.identifier,
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
    this.confirmPassword = data.confirmPassword || "";
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
      confirmPassword: this.confirmPassword,
      country: this.country,
    };
  }
}
