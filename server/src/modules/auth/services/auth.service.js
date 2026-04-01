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
        // Validation
        const validationErrors = validateLoginInput(userData);
        if (validationErrors.length > 0) {
            const error = new Error("Validation Failed");
            error.statusCode = 400;
            error.details = validationErrors;
            throw error;
        }

        const { identifier, password } = userData;

        // Fetch User
        const user = await AuthRepository.findByEmailOrUsername(identifier);
        if (!user) {
            const error = new Error("Invalid credentials");
            error.statusCode = 401;
            throw error;
        }

        // Check Brute-Force Lock
        if (user.lockUntil && user.lockUntil > Date.now()) {
            const error = new Error("Account locked due to 5 failed attempts. Try again later after 60 seconds.");
            error.statusCode = 403;
            throw error;
        }

        // Verify Password
        const isMatch = await bcryptjs.compare(password, user.password);
        if (!isMatch) {
            await AuthRepository.incrementLoginAttempts(user); // Increment failed attempts
            const error = new Error("Invalid credentials");
            error.statusCode = 401;
            throw error;
        }

        // Success cleanup & JWT
        await AuthRepository.resetLoginAttempts(user);
        await AuthRepository.updateLastLogin(user._id);

        generateTokenAndSetCookie(res, user._id, user.role); // Provide JWS token
        return { user };
    },

    logoutUser: async (res) => {
        // Clear user cookie
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