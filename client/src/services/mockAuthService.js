/**
 * Mock Authentication Service
 * Stores user credentials in localStorage for testing
 * ONLY FOR DEVELOPMENT - Replace with real API calls in production
 */

const USERS_STORAGE_KEY = "ttt_mock_users";
const AUTH_TOKEN_KEY = "ttt_auth_token";
const LOGIN_ATTEMPTS_KEY = "ttt_login_attempts";
const MAX_ATTEMPTS = 5;
const ATTEMPT_WINDOW = 60000; // 60 seconds in milliseconds

// Simple hash function (NOT secure - only for mock testing)
const hashPassword = (password) => {
    return btoa(password); // Base64 encode - DO NOT USE IN PRODUCTION
};

const verifyPassword = (storedHash, inputPassword) => {
    return storedHash === hashPassword(inputPassword);
};

/**
 * Get login attempts for an email from localStorage
 */
const getLoginAttempts = (email) => {
    const attempts = localStorage.getItem(LOGIN_ATTEMPTS_KEY);
    if (!attempts) return [];
    
    const parsed = JSON.parse(attempts);
    const userAttempts = parsed[email] || [];
    
    // Filter out attempts older than the time window
    const now = Date.now();
    const recentAttempts = userAttempts.filter(
        (timestamp) => now - timestamp < ATTEMPT_WINDOW
    );
    
    // Update localStorage with filtered attempts
    if (recentAttempts.length !== userAttempts.length) {
        parsed[email] = recentAttempts;
        localStorage.setItem(LOGIN_ATTEMPTS_KEY, JSON.stringify(parsed));
    }
    
    return recentAttempts;
};

/**
 * Record a failed login attempt
 */
const recordFailedAttempt = (email) => {
    const attempts = localStorage.getItem(LOGIN_ATTEMPTS_KEY);
    const parsed = attempts ? JSON.parse(attempts) : {};
    
    if (!parsed[email]) {
        parsed[email] = [];
    }
    
    parsed[email].push(Date.now());
    localStorage.setItem(LOGIN_ATTEMPTS_KEY, JSON.stringify(parsed));
};

/**
 * Clear login attempts for an email (on successful login)
 */
const clearLoginAttempts = (email) => {
    const attempts = localStorage.getItem(LOGIN_ATTEMPTS_KEY);
    if (!attempts) return;
    
    const parsed = JSON.parse(attempts);
    delete parsed[email];
    localStorage.setItem(LOGIN_ATTEMPTS_KEY, JSON.stringify(parsed));
};

/**
 * Check if account is locked
 */
const isAccountLocked = (email) => {
    const attempts = getLoginAttempts(email);
    return attempts.length >= MAX_ATTEMPTS;
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
     * @returns {Object} - { success: boolean, message: string, token?: string, user?: Object, attempts?: number, isLocked?: boolean }
     */
    login: (email, password) => {
        // Check if account is locked
        if (isAccountLocked(email)) {
            return {
                success: false,
                message: "Account locked due to too many failed attempts. Try again in 60 seconds.",
                isLocked: true,
                attemptsRemaining: 0,
            };
        }

        const users = mockAuthService.getAllUsers();

        // Find user by email
        const user = users.find((u) => u.email === email);

        if (!user) {
            recordFailedAttempt(email);
            const attempts = getLoginAttempts(email);
            const attemptsRemaining = MAX_ATTEMPTS - attempts.length;
            
            return {
                success: false,
                message: "Invalid email or password",
                attemptsRemaining,
            };
        }

        // Verify password
        if (!verifyPassword(user.passwordHash, password)) {
            recordFailedAttempt(email);
            const attempts = getLoginAttempts(email);
            const attemptsRemaining = MAX_ATTEMPTS - attempts.length;
            
            return {
                success: false,
                message: "Invalid email or password",
                attemptsRemaining,
            };
        }

        // Clear attempts on successful login
        clearLoginAttempts(email);

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
        localStorage.removeItem(LOGIN_ATTEMPTS_KEY);
    },

    /**
     * Get remaining attempts for an email
     */
    getRemainingAttempts: (email) => {
        const attempts = getLoginAttempts(email);
        return Math.max(0, MAX_ATTEMPTS - attempts.length);
    },

    /**
     * Check if account is locked for an email
     */
    isAccountLockedForEmail: (email) => {
        return isAccountLocked(email);
    },
};
