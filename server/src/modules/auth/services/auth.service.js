import bcryptjs from 'bcryptjs';
import { AuthRepository } from "../repositories/auth.repository.js";
import { generateTokenAndSetCookie } from "../../../utils/token.util.js";
import { validateRegisterInput, validateLoginInput } from "../../../utils/validate.js";

export const AuthService = {
    registerUser: async (userData, res) => {
        const validationErrors = validateRegisterInput(userData);

        // Show a error to the controller
        if (validationErrors.length > 0) {
            const error = new Error("Invalid input provided.");
            error.statusCode = 400; 
            error.errorCode = "VALIDATION_ERROR"; 
            error.details = validationErrors; 
            throw error;
        }
        
        const { email, password, username, country } = userData;
        const hashedPassword = await bcryptjs.hash(password, 10); 

        const newUser = await AuthRepository.createUser({
            email,
            username,
            password: hashedPassword,
            country,
        });

        // Generate JWT token (JWS) with id and role
        const token = generateTokenAndSetCookie(res, newUser._id, newUser.role);
        
        return { user: newUser, token };
    },

    loginUser: async (userData, res) => {
        const validationErrors = validateLoginInput(userData);
        if (validationErrors.length > 0) {
            const error = new Error("Invalid input provided.");
            error.statusCode = 400;
            error.errorCode = "VALIDATION_ERROR";
            error.details = validationErrors;
            throw error;
        }

        const { identifier, password } = userData;

        const user = await AuthRepository.findByEmailOrUsername(identifier);
        if (!user) {
            const error = new Error("Invalid credentials");
            error.statusCode = 401;
            error.errorCode = "INVALID_CREDENTIALS"; 
            throw error;
        }

        if (user.lockUntil && user.lockUntil > Date.now()) {
            const error = new Error("Account locked due to 5 failed attempts. Try again later after 60 seconds.");
            error.statusCode = 403;
            error.errorCode = "ACCOUNT_LOCKED";
            throw error;
        }

        const isMatch = await bcryptjs.compare(password, user.password);
        if (!isMatch) {
            await AuthRepository.incrementLoginAttempts(user); 
            const error = new Error("Invalid credentials");
            error.statusCode = 401;
            error.errorCode = "INVALID_CREDENTIALS"; 
            throw error;
        }

        await AuthRepository.resetLoginAttempts(user);
        await AuthRepository.updateLastLogin(user._id);

        // Generate JWT token (JWS) with only id and role - minimal identity info
        const token = generateTokenAndSetCookie(res, user._id, user.role);
        return { user, token };
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