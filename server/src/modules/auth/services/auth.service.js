import bcryptjs from "bcryptjs";
import { AuthRepository } from "../repositories/auth.repository.js";
import { AuthDTO } from "../dtos/auth.dto.js";
import { generateTokenAndSetCookie, clearAccessTokenCookies } from "../../../utils/token.util.js";
import { validateRegisterInput, validateLoginInput,  validateRegisterConflicts } from "../validators/auth.validator.js";
import { RoomInterface } from "../../room/interfaces/room.interface.js";
import { eventBus } from "../../../utils/eventBus.util.js";
import { SYSTEM_EVENTS } from "../../../utils/constants/event.containts.js";

// Service contains auth business rules and throws standardized errors for errorMiddleware.
export const AuthService = {
     // [POST] /auth/register endponit
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

        return AuthDTO.toUserResponse(newUser);
    },

     // [POST] /auth/login endponit
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

        const user = await AuthRepository.findByEmailOrUsername(identifier);
        if (user?.auth?.lockUntil > new Date()) {
            throw { statusCode: 403, error: 'ACCOUNT_LOCKED', message: 'Account is temporarily locked. Try again after one minute.' };
        }
        const isPasswordCorrect = user ? await bcryptjs.compare(password, user.passwordHash) : false;

        // Check if account exists and active
        if (user && !user.isActive) {
            throw {
                statusCode: 403,
                error: "ACCOUNT_DEACTIVATED",
                message: "Login failed. Your account has been deactivated.",
                cause: "An administrator has disabled this account.",
                valid_example: "Contact an administrator to request reactivation."
            };
        }

        if  (!user || !isPasswordCorrect) {
            const updatedUser = user ? await AuthRepository.incrementLoginAttempts(user) : null;

            //  Check lock after increment
            if (updatedUser?.auth?.lockUntil && updatedUser.auth.lockUntil > new Date()) {
                const secondsRemaining = Math.ceil((new Date(updatedUser.auth.lockUntil).getTime() - Date.now()) / 1000);
                throw {
                    statusCode: 403,
                    error: "ACCOUNT_LOCKED",
                    message: "Login failed. Account is temporarily locked.",
                    cause: `Too many failed attempts. Try again in ${secondsRemaining} seconds.`,
                    valid_example: `Wait ${secondsRemaining} seconds before trying again.`
                };
            }
            throw {
                statusCode: 401,
                error: "INVALID_CREDENTIALS",
                message: "Login failed. Invalid identifier or password.",
                cause: "No account matches the provided credentials.",
                valid_example: "Ensure your username/email and password are correct."
            };
        }

        const sessionUser = await AuthRepository.startSession(user._id);
        if (!sessionUser) {
            throw { statusCode: 403, error: 'LOGIN_UNAVAILABLE', message: 'The account was locked or deactivated. Please try again later.' };
        }
        eventBus.publish(SYSTEM_EVENTS.DUPLICATE_LOGIN, {
            userId: user.id, tokenVersion: sessionUser.auth.tokenVersion
        });
        generateTokenAndSetCookie(res, user._id, sessionUser.role, sessionUser.isPremium, sessionUser.auth.tokenVersion);
        return AuthDTO.toUserResponse(sessionUser);
    },

     // [POST] /auth/logout endponit
    logoutUser: async (res, session) => {
        // Idempotent: with no valid session (already logged out, expired cookie) there is nothing to revoke,
        // but the cookie is still cleared and the call still succeeds.
        const user = session ? await AuthRepository.revokeSession(session.id, session.tokenVersion) : null;
        if (user) {
            eventBus.publish(SYSTEM_EVENTS.SESSION_REVOKED, {
                userId: user.id, tokenVersion: user.auth.tokenVersion, reason: 'You have logged out.', code: 'LOGGED_OUT'
            });
        }
        clearAccessTokenCookies(res);
    },

     // [GET] /auth/check-auth endponit
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

        return AuthDTO.toCheckAuthResponse(user, activeRoom);
    },

    // Interface/Cross-Module Methods 
    setPremiumExpiry: async (userId, premiumExpiresAt) => {
        const user = await AuthRepository.updatePremiumExpiry(userId, premiumExpiresAt);
        if (!user) return null;
        return AuthDTO.toUserResponse(user);
    },

    setAccountStatus: async (userId, isActive) => {
        const user = await AuthRepository.updateAccountStatus(userId, isActive);
        if (!user) return null;
        return AuthDTO.toUserResponse(user);
    },

    getUserById: async (userId) => {
        return AuthRepository.findById(userId);
    },

    updateUserProfile: async (userId, updates) => {
        return AuthRepository.updateUser(userId, updates);
    },

    checkProfileConflicts: async (userId, email, username) => {
        return AuthRepository.checkProfileConflicts(userId, email, username);
    },

    changePassword: async (userId, oldPassword, newPassword) => {
        const user = await AuthRepository.findByIdWithPassword(userId);
        if (!user) {
            throw {
                statusCode: 404,
                error: "USER_NOT_FOUND",
                message: "Password change failed. User not found.",
                cause: "No user record exists in the database matching the authenticated ID.",
                valid_example: "Ensure your session is valid and active."
            };
        }

        const isPasswordCorrect = await bcryptjs.compare(String(oldPassword), user.passwordHash);
        if (!isPasswordCorrect) {
            throw {
                statusCode: 401,
                error: "INVALID_CREDENTIALS",
                message: "Password change failed. Incorrect old password.",
                cause: "The provided old password does not match the current password on record.",
                valid_example: "Provide the correct current password to authorize this change."
            };
        }

        const newPasswordHash = await bcryptjs.hash(String(newPassword), 10);
        const updatedUser = await AuthRepository.updatePassword(userId, newPasswordHash);
        eventBus.publish(SYSTEM_EVENTS.SESSION_REVOKED, {
            userId: String(userId), tokenVersion: updatedUser.auth.tokenVersion,
            reason: 'Your password has changed. Please log in again.', code: 'PASSWORD_CHANGED'
        });

        return null;
    },

    incrementPlatformRevenue: async (amount) => {
        return await AuthRepository.incrementPlatformRevenue(amount);
    },

    getPlatformMetrics: async () => {
        return AuthRepository.getPlatformMetrics();
    },
    
    getPaginatedUsers: async (filter, sort, skip, limit) => {
        return AuthRepository.findUsersPaginated(filter, sort, skip, limit);
    }
};
