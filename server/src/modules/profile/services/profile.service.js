import { AuthInterface } from '../../auth/interfaces/auth.interface.js';
import { GameInterface } from '../../game/interfaces/game.interface.js';
import { ProfileDTO } from '../dtos/profile.dto.js'
import { validateProfileUpdate } from '../validators/profile.validator.js';

export const ProfileService = {
    getProfile: async (userId) => {
        const user = await AuthInterface.getUserById(userId);
        if (!user) {
            throw {
                statusCode: 404,
                error: "USER_NOT_FOUND",
                message: "Profile fetch failed. User not found.",
                cause: "No user record exists in the database matching the authenticated ID.",
                valid_example: "Ensure your session is valid and active."
            };
        }
        return ProfileDTO.toBaseProfile(user);
    },

    getProfileOverview: async (userId) => {
        const user = await AuthInterface.getUserById(userId);
        if (!user) {
            throw {
                statusCode: 404,
                error: "USER_NOT_FOUND",
                message: "Profile overview fetch failed. User not found.",
                cause: "No user record exists for the authenticated ID.",
                valid_example: "Ensure your session is valid and active."
            };
        }

        // Orchestrate data gathering for the overview
        const wallet = { balance: user.wallet?.balance || 0 };
        const subscription = {
            isPremium: user.isPremium,
            premiumExpiresAt: user.premiumExpiresAt
        };
        
        const stats = await GameInterface.getUserGameStats(userId);
        const recentGames = await GameInterface.getRecentGames(userId, 5);

        return ProfileDTO.toProfileOverview({ user, wallet, subscription, stats, recentGames });
    },

    updateProfile: async (userId, updateData) => {
        const validationErrors = validateProfileUpdate(updateData);
        if (validationErrors.length > 0) {
            throw {
                statusCode: 400,
                error: "VALIDATION_ERROR",
                message: "Invalid profile update data.",
                cause: "One or more provided fields failed format validation.",
                valid_example: "Provide a valid username, email, or country.",
                details: validationErrors
            };
        }

        const allowedUpdates = {};
        if (updateData.username) allowedUpdates.username = String(updateData.username).trim();
        if (updateData.email) allowedUpdates.email = String(updateData.email).trim().toLowerCase();
        if (updateData.country) allowedUpdates.country = String(updateData.country).trim();

        if (Object.keys(allowedUpdates).length === 0) {
            throw {
                statusCode: 400,
                error: "BAD_REQUEST",
                message: "Profile update failed. No valid fields provided.",
                cause: "The request body did not contain 'username', 'email', or 'country'.",
                valid_example: "{\"username\": \"New_Name_123\", \"country\": \"VN\"}"
            };
        }

        // Enforce uniqueness constraints
        if (allowedUpdates.email || allowedUpdates.username) {
            await AuthInterface.checkProfileConflicts(userId, allowedUpdates.email, allowedUpdates.username);
        }

        const updatedUser = await AuthInterface.updateUserProfile(userId, allowedUpdates);
        return ProfileDTO.toBaseProfile(updatedUser);
    }
};