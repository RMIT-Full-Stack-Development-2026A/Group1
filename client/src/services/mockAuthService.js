/**
 * Mock Authentication Service
 * Stores user credentials in localStorage for testing
 * ONLY FOR DEVELOPMENT - Replace with real API calls in production
 */

const USERS_STORAGE_KEY = "ttt_mock_users";
const AUTH_TOKEN_KEY = "ttt_auth_token";

// Simple hash function (NOT secure - only for mock testing)
const hashPassword = (password) => {
    return btoa(password); // Base64 encode - DO NOT USE IN PRODUCTION
};

const verifyPassword = (storedHash, inputPassword) => {
    return storedHash === hashPassword(inputPassword);
};

export const mockAuthService = {
    /**
     * Get all registered users from localStorage
     */
    getAllUsers: () => {
        const users = localStorage.getItem(USERS_STORAGE_KEY);
        return users ? JSON.parse(users) : [];
    },

    /**
     * Register a new user
     * @param {Object} user - { username, email, password, country }
     * @returns {Object} - { success: boolean, message: string, user?: Object }
     */
    register: (user) => {
        const users = mockAuthService.getAllUsers();

        // Validate inputs
        if (!user.username || !user.email || !user.password) {
            return {
                success: false,
                message: "All fields are required",
            };
        }

        // Check if user already exists
        const existingUser = users.find(
            (u) => u.email === user.email || u.username === user.username
        );

        if (existingUser) {
            return {
                success: false,
                message: "User already exists",
            };
        }

        // Create new user
        const newUser = {
            id: Date.now().toString(), // Simple ID generation
            username: user.username,
            email: user.email,
            passwordHash: hashPassword(user.password),
            country: user.country || "NEO-TOKYO (NT-01)",
            createdAt: new Date().toISOString(),
        };

        // Save to localStorage
        users.push(newUser);
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

        // Return user without password for security
        const { passwordHash, ...safeUser } = newUser;
        return {
            success: true,
            message: "User registered successfully",
            user: safeUser,
        };
    },

    /**
     * Login a user
     * @param {string} email
     * @param {string} password
     * @returns {Object} - { success: boolean, message: string, token?: string, user?: Object }
     */
    login: (email, password) => {
        const users = mockAuthService.getAllUsers();

        // Find user by email
        const user = users.find((u) => u.email === email);

        if (!user) {
            return {
                success: false,
                message: "Invalid email or password",
            };
        }

        // Verify password
        if (!verifyPassword(user.passwordHash, password)) {
            return {
                success: false,
                message: "Invalid email or password",
            };
        }

        // Generate mock token (UUID-like)
        const token = `mock_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Store token in localStorage
        localStorage.setItem(AUTH_TOKEN_KEY, token);

        // Return user without password
        const { passwordHash, ...safeUser } = user;
        return {
            success: true,
            message: "Login successful",
            token,
            user: safeUser,
        };
    },

    /**
     * Logout user
     */
    logout: () => {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        return { success: true, message: "Logged out successfully" };
    },

    /**
     * Get current auth token
     */
    getAuthToken: () => {
        return localStorage.getItem(AUTH_TOKEN_KEY);
    },

    /**
     * Check if user is authenticated
     */
    isAuthenticated: () => {
        return !!localStorage.getItem(AUTH_TOKEN_KEY);
    },

    /**
     * Get current user from token (simplified - in real app would validate with backend)
     */
    getCurrentUser: () => {
        if (!mockAuthService.isAuthenticated()) {
            return null;
        }

        // In a real app, you'd verify the token with the backend
        // For mock, we'll just return a placeholder
        return {
            id: "mock_user",
            username: "Player",
            email: "player@example.com",
        };
    },

    /**
     * Clear all mock data (for testing)
     */
    clearMockData: () => {
        localStorage.removeItem(USERS_STORAGE_KEY);
        localStorage.removeItem(AUTH_TOKEN_KEY);
    },
};
