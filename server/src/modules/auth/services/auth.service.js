import bcryptjs from 'bcryptjs';
import { AuthRepository } from "../repositories/auth.repository.js";
import { generateTokenAndSetCookie } from "../../../utils/token.util.js";
import { validateRegisterInput, validateLoginInput } from "../../../utils/validate.js";

export const AuthService = {
    registerUser: async (userData) => {
        const { email, password, username, country } = userData;

        //  Enforce Unique Identity (Check both Email and Username)
        // We check for any user that might already have this email or this username
        const emailConflict = await AuthRepository.findByEmail(email);
        if (emailConflict) {
            throw {
                status: 409, 
                error: "EMAIL_ALREADY_EXISTS",
                message: "Registration failed. Email is already in use.",
                cause: "The provided email address is already registered to another account.",
                valid_example: "new_player_email@example.com"
            };
        }

        const usernameConflict = await AuthRepository.findByEmailOrUsername(username);
        if (usernameConflict) {
            throw {
                status: 409,
                error: "USERNAME_ALREADY_TAKEN",
                message: "Registration failed. Username is already taken.",
                cause: "The provided username is already claimed by another player.",
                valid_example: "Unique_Player_2026"
            };
        }

        // Secure Password Hashing
        const hashedPassword = await bcryptjs.hash(password, 10);

        // Create user via Repository 
        const newUser = await AuthRepository.createUser({
            email,
            username,
            password: hashedPassword,
            country,
            role: "PLAYER",
            isActive: true,
            isPremium: false
        });

        return newUser;
    },

    loginUser: async (userData, res) => {
        const { identifier, password } = userData;

        //  Find user by email or username
        const user = await AuthRepository.findByEmailOrUsername(identifier);
        if (!user) {
            throw {
                status: 401, 
                error: "INVALID_CREDENTIALS",
                message: "Login failed. Invalid identifier or password.",
                cause: "No account matches the provided credentials.",
                valid_example: "Ensure your email/username and password are correct."
            };
        }

        //Check for account lockout 
        if (user.lockUntil && user.lockUntil > Date.now()) {
            throw {
                status: 403,
                error: "ACCOUNT_LOCKED",
                message: "Login failed. Account is temporarily locked.",
                cause: "Account locked due to 5 failed attempts. Please wait 60 seconds.",
                valid_example: "Try logging in again after 1 minute."
            };
        }

        // 3. Verify Password
        const isMatch = await bcryptjs.compare(password, user.password);
        if (!isMatch) {
            await AuthRepository.incrementLoginAttempts(user); 
            throw {
                status: 401,
                error: "INVALID_CREDENTIALS",
                message: "Login failed. Invalid identifier or password.",
                cause: "The password provided does not match our records.",
                valid_example: "Check for typos or reset your password if forgotten."
            };
        }

        // Check if account is active 
        if (!user.isActive) {
            throw {
                status: 403,
                error: "ACCOUNT_DEACTIVATED",
                message: "Login failed. Your account has been deactivated.",
                cause: "An administrator has disabled this account. Access is restricted.",
                valid_example: "Contact a system administrator to request reactivation."
            };
        }

        // Success: Reset attempts and update login time
        await AuthRepository.resetLoginAttempts(user);
        await AuthRepository.updateLastLogin(user._id);

        //  Generate Token 
        // Ensure payload 
        generateTokenAndSetCookie(res, user._id, user.role, user.isPremium); 
        
        return { user };
    },

    logoutUser: async (res) => {
        res.clearCookie("access_token");
        return { success: true };
    },

    checkAuthUser: async (userId) => {
        const user = await AuthRepository.findById(userId);
        if (!user) {
            const error = new Error("User not found");
            error.statusCode = 404;
            error.errorCode = "USER_NOT_FOUND";
            throw error;
        }

        if (!user.isActive) {
            const error = new Error("Account is deactivated");
            error.statusCode = 403;
            error.errorCode = "ACCOUNT_DEACTIVATED";
            throw error;
        };

        return { user };
    }
};