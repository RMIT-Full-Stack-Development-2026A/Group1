import bcryptjs from "bcryptjs";
import { AuthRepository } from "../repositories/auth.repository.js";
import { generateTokenAndSetCookie } from "../../../utils/token.util.js";
import { validateRegisterInput, validateLoginInput,  validateRegisterConflicts } from "../validators/auth.validator.js";
import { RoomInterface } from "../../room/interfaces/room.interface.js";

// Service contains auth business rules and throws standardized errors for errorMiddleware.
export const AuthService = {
    registerUser: async (userData) => {
        const validationErrors = validateRegisterInput(userData);
        if (validationErrors.length > 0) {
            throw {
                statusCode: 400,
                error: "VALIDATION_ERROR",
                message: "Invalid registration input provided.",
                cause: "One or more registration fields failed validation.",
                valid_example: "Provide a valid username, email, strong password, matching confirmPassword, and country.",
                details: validationErrors
            };
        }

        const email = String(userData.email).trim().toLowerCase();
        const username = String(userData.username).trim();
        const password = String(userData.password);
        const country = String(userData.country).trim();

        await validateRegisterConflicts(email, username);

        const passwordHash = await bcryptjs.hash(password, 10);

        const newUser = await AuthRepository.createUser({
            email,
            username,
            passwordHash,
            country
        });

        return newUser;
    },

    loginUser: async (loginData, res) => {
        const validationErrors = validateLoginInput(loginData);
        if (validationErrors.length > 0) {
            throw {
                statusCode: 400,
                error: "VALIDATION_ERROR",
                message: "Invalid login input provided.",
                cause: "Identifier or password is missing or malformed.",
                valid_example: "Provide identifier and password, for example { identifier: 'player@example.com', password: 'StrongP@ss1' }.",
                details: validationErrors
            };
        }

        const identifier = String(loginData.identifier).trim();
        const password = String(loginData.password);

        const user = await AuthRepository.findByEmailOrUsernameForLogin(identifier);
        if (!user) {
            throw {
                statusCode: 401,
                error: "INVALID_CREDENTIALS",
                message: "Login failed. Invalid identifier or password.",
                cause: "No account matches the provided credentials.",
                valid_example: "Ensure your username/email and password are correct."
            };
        }

        if (user.auth?.lockUntil && user.auth.lockUntil > new Date()) {
            const secondsRemaining = Math.ceil((new Date(user.auth.lockUntil).getTime() - Date.now()) / 1000);
            throw {
                statusCode: 403,
                error: "ACCOUNT_LOCKED",
                message: "Login failed. Account is temporarily locked.",
                cause: `Too many failed attempts. Try again in ${secondsRemaining} seconds.`,
                valid_example: `Wait ${secondsRemaining} seconds before trying again.`
            };
        }

        if (user.auth?.lockUntil && user.auth.lockUntil <= new Date()) {
            await AuthRepository.clearExpiredLock(user._id);
            user.auth.loginAttempts = 0;
            user.auth.lockUntil = null;
        }

        const isPasswordCorrect = await bcryptjs.compare(password, user.passwordHash);
        if (!isPasswordCorrect) {
            await AuthRepository.incrementLoginAttempts(user);
            throw {
                statusCode: 401,
                error: "INVALID_CREDENTIALS",
                message: "Login failed. Invalid identifier or password.",
                cause: "The provided password does not match our records.",
                valid_example: "Check for typos or reset your password if needed."
            };
        }

        if (!user.isActive) {
            throw {
                statusCode: 403,
                error: "ACCOUNT_DEACTIVATED",
                message: "Login failed. Your account has been deactivated.",
                cause: "An administrator has disabled this account.",
                valid_example: "Contact an administrator to request reactivation."
            };
        }

        await Promise.all([
            AuthRepository.resetLoginAttempts(user._id),
            AuthRepository.updateLastLogin(user._id)
        ]);

        generateTokenAndSetCookie(res, user._id, user.role, user.isPremium);

        const safeUser = await AuthRepository.findById(user._id);
        return { user: safeUser };
    },

    logoutUser: async (res) => {
        res.clearCookie("access_token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            path: "/"
        });
    },

    checkAuthUser: async (userId) => {
        const user = await AuthRepository.findById(userId);

        if (!user) {
            throw {
                statusCode: 404,
                error: "USER_NOT_FOUND",
                message: "Authentication check failed. User not found.",
                cause: "The user id from the verified token does not exist in the database.",
                valid_example: "Use a valid session token for an existing user account."
            };
        }

        if (!user.isActive) {
            throw {
                statusCode: 403,
                error: "ACCOUNT_DEACTIVATED",
                message: "Authentication check failed. Account is deactivated.",
                cause: "The user account is currently disabled and cannot access protected routes.",
                valid_example: "Ask an administrator to reactivate the account before retrying."
            };
        }

        const activeRoom = await RoomInterface.getActiveRoomSummaryByUserId(userId);

        return { user, activeRoom };
    }
};