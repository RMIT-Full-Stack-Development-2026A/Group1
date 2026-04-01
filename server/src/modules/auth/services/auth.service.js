import bcryptjs from 'bcryptjs';
import { AuthRepository } from "../repositories/auth.repository.js";
import { generateTokenAndSetCookie } from "../../../utils/token.util.js";
import { validateRegisterInput, validateLoginInput, validateRegisterConflicts } from "../../../utils/validate.js";

export const AuthService = {
    registerUser: async (userData) => {
        // Validation 
        const validationErrors = validateRegisterInput(userData);
        if (validationErrors.length > 0) {
            throw {
                status: 400,
                error: "VALIDATION_ERROR",
                message: "Invalid input provided.",
                details: validationErrors
            };
        }

        const { email, password, username, country } = userData;

        // Async Validation (DB Conflicts)
        await validateRegisterConflicts(email, username);

        // Hash Password
        const hashedPassword = await bcryptjs.hash(password, 10);

        // Create User
        const newUser = await AuthRepository.createUser({
            email,
            username,
            password: hashedPassword,
            country,
        });

        return newUser;
    },

    loginUser: async (userData, res) => {
        const validationErrors = validateLoginInput(userData);
        if (validationErrors.length > 0) {
            throw {
                status: 400,
                error: "VALIDATION_ERROR",
                message: "Invalid input provided.",
                details: validationErrors
            };
        }

        const { identifier, password } = userData;

        //  Find user by email or username
        const user = await AuthRepository.findByEmailOrUsername(identifier);
        if (!user) {
            throw {
                status: 401,
                error: "INVALID_CREDENTIALS",
                message: "Login failed. Invalid identifier or password.",
                cause: "No account matches the provided credentials.",
                example: "Ensure your email/username and password are correct."
            };
        }

        // Check for account lockout 
        if (user.lockUntil && user.lockUntil > Date.now()) {
            // Show user lock time left before next login
            const lockTimeLeft = Math.floor((user.lockUntil - Date.now()) / 1000);
            throw {
                status: 403,
                error: "ACCOUNT_LOCKED",
                message: "Login failed. Account is temporarily locked.",
                cause: `Account locked due to multiple failed attempts. Please wait ${lockTimeLeft} seconds.`,
                example: `Try logging in again after ${lockTimeLeft} seconds.`
            };
        }

        // Verify Password
        const isMatch = await bcryptjs.compare(password, user.password);
        if (!isMatch) {
            await AuthRepository.incrementLoginAttempts(user);
            throw {
                status: 401,
                error: "INVALID_CREDENTIALS",
                message: "Login failed. Invalid identifier or password.",
                cause: "The password provided does not match our records.",
                example: "Check for typos or reset your password if forgotten."
            };
        }

        // Check if account is active
        if (!user.isActive) {
            throw {
                status: 403,
                error: "ACCOUNT_DEACTIVATED",
                message: "Login failed. Your account has been deactivated.",
                cause: "An administrator has disabled this account. Access is restricted.",
                example: "Contact a system administrator to request reactivation."
            };
        }

        // Reset attempts and update login time
        await AuthRepository.resetLoginAttempts(user);
        await AuthRepository.updateLastLogin(user._id);

        //  Generate Token
        generateTokenAndSetCookie(res, user._id, user.role, user.isPremium); 
        
        return { user };
    },

    logoutUser: async (res) => {
        res.clearCookie("access_token");
        return; 
    },

    checkAuthUser: async (userId) => {
        const user = await AuthRepository.findById(userId);
        if (!user) {
            throw {
                status: 404,
                error: "USER_NOT_FOUND",
                message: "Authentication check failed. User not found.",
                cause: "The user ID provided in the token does not exist in the database.",
                example: "A valid user ID."
            };
        }

        if (!user.isActive) {
            throw {
                status: 403,
                error: "ACCOUNT_DEACTIVATED",
                message: "Authentication check failed. Account is deactivated.",
                cause: "The user account is currently disabled.",
                example: "Contact support for reactivation."
            };
        }

        return { user };
    }
};