/**
 * JWT (JWS) Utilities
 * Handles decoding JWT tokens to extract user identity information
 * 
 * JWT Format: Header.Payload.Signature (JWS - JSON Web Signature)
 * The Payload contains user claims: id, email, username, role, etc.
 */

/**
 * Decode JWT payload without verification (client-side only)
 * Note: This does NOT verify the signature - backend already did that
 * We only extract the claims for client-side state management
 * 
 * @param {string} token - JWT token
 * @returns {Object} - Decoded payload with user identity info
 */
export const decodeJWT = (token) => {
    try {
        if (!token) return null;

        // JWT structure: header.payload.signature
        const parts = token.split('.');
        if (parts.length !== 3) {
            console.warn('[JWT] Invalid JWT format - expected 3 parts');
            return null;
        }

        // Decode the payload (second part)
        // Add padding if needed for proper base64 decoding
        const payload = parts[1];
        const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);

        // Decode base64url to JSON
        const decodedStr = atob(paddedPayload);
        const decodedPayload = JSON.parse(decodedStr);

        console.log('[JWT] Decoded payload:', {
            userId: decodedPayload.userId,
            role: decodedPayload.role,
        });

        return decodedPayload;
    } catch (error) {
        console.error('[JWT] Failed to decode token:', error.message);
        return null;
    }
};

/**
 * Check if JWT token is expired
 * @param {string} token - JWT token
 * @returns {boolean} - True if expired, false if valid
 */
export const isTokenExpired = (token) => {
    try {
        const payload = decodeJWT(token);
        if (!payload || !payload.exp) {
            return true; // No expiration info = assume expired for safety
        }

        // Convert expiration time (seconds) to milliseconds
        const expirationTime = payload.exp * 1000;
        const currentTime = Date.now();

        if (currentTime > expirationTime) {
            console.log('[JWT] Token expired');
            return true;
        }

        // Warn if token expires soon (within 5 minutes)
        const timeUntilExpiry = (expirationTime - currentTime) / 1000;
        if (timeUntilExpiry < 300) {
            console.warn(`[JWT] Token expiring soon in ${Math.floor(timeUntilExpiry)}s`);
        }

        return false;
    } catch (error) {
        console.error('[JWT] Error checking expiration:', error.message);
        return true; // Assume expired on error for safety
    }
};

/**
 * Extract user identity information from JWT
 * @param {string} token - JWT token
 * @returns {Object} - User identity object { id, role }
 */
export const extractUserIdentity = (token) => {
    const payload = decodeJWT(token);
    if (!payload) return null;

    return {
        userId: payload.userId,
        id: payload.userId, // Alias for compatibility
        role: payload.role || 'PLAYER', // Default to PLAYER
    };
};

/**
 * Get JWT token from localStorage
 * @returns {string|null} - JWT token or null if not found
 */
export const getStoredToken = () => {
    return localStorage.getItem('jwt_token');
};

/**
 * Save JWT token to localStorage
 * @param {string} token - JWT token to save
 */
export const saveToken = (token) => {
    if (token) {
        localStorage.setItem('jwt_token', token);
        console.log('[JWT] Token saved to localStorage');
    }
};

/**
 * Clear JWT token from localStorage
 */
export const clearToken = () => {
    localStorage.removeItem('jwt_token');
    console.log('[JWT] Token cleared from localStorage');
};

/**
 * Validate JWT token
 * @param {string} token - JWT token
 * @returns {boolean} - True if token is valid and not expired
 */
export const isTokenValid = (token) => {
    if (!token) return false;

    // Check format
    const parts = token.split('.');
    if (parts.length !== 3) return false;

    // Check if expired
    if (isTokenExpired(token)) return false;

    // Can decode payload
    const payload = decodeJWT(token);
    return payload !== null;
};
