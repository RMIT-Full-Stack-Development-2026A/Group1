import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';

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
        
        // Fetch stats and recent games
        const [stats, recentGames] = await Promise.all([
            GameInterface.getUserGameStats(userId),
            GameInterface.getRecentGames(userId, 5)
        ]);

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
                valid_example: "Provide a valid username, email, country or avatar URL.",
                details: validationErrors
            };
        }

        const allowedUpdates = {};
        if (updateData.username) allowedUpdates.username = String(updateData.username).trim();
        if (updateData.email) allowedUpdates.email = String(updateData.email).trim().toLowerCase();
        if (updateData.country) allowedUpdates.country = String(updateData.country).trim();
        if (updateData.avatar) allowedUpdates.avatar = String(updateData.avatar).trim();

        if (Object.keys(allowedUpdates).length === 0) {
            throw {
                statusCode: 400,
                error: "BAD_REQUEST",
                message: "Profile update failed. No valid fields provided.",
                cause: "The request body did not contain 'username', 'email', 'country', or 'avatar'.",
                valid_example: "{\"username\": \"New_Name_123\", \"country\": \"VN\", \"avatar\": \"https://link-photo.jpg\"}"
            };
        }

        // Enforce uniqueness constraints
        if (allowedUpdates.email || allowedUpdates.username) {
            await AuthInterface.checkProfileConflicts(userId, allowedUpdates.email, allowedUpdates.username);
        }

        const updatedUser = await AuthInterface.updateUserProfile(userId, allowedUpdates);
        return ProfileDTO.toBaseProfile(updatedUser);
    },

    uploadAvatar: async (userId, file) => {
        if (!file) {
            throw {
                statusCode: 400,
                error: "BAD_REQUEST",
                message: "No file uploaded.",
                cause: "The request did not contain a file under the 'avatar' field.",
                valid_example: "Use multipart/form-data with a file field named 'avatar'."
            };
        }

        try {
            // 1. Define filename and path (assuming an 'uploads' folder exists)
            const fileName = `avatar-${userId}-${Date.now()}.webp`;
            const uploadPath = path.join('uploads', 'avatars', fileName);

            // 2. Process image with Sharp: Resize 200x200, convert to WebP
            await sharp(file.buffer)
                .resize(200, 200, { fit: 'cover' })
                .webp({ quality: 80 })
                .toFile(uploadPath);

            // 3. Update the avatar URL in the database using the existing interface
            // For now, we save the relative path or a URL
            const avatarUrl = `/uploads/avatars/${fileName}`;
            const updatedUser = await AuthInterface.updateUserProfile(userId, { avatar: avatarUrl });

            return ProfileDTO.toBaseProfile(updatedUser);
        } catch (error) {
            console.error('[Sharp Error]', error);
            throw {
                statusCode: 500,
                error: "IMAGE_PROCESSING_FAILED",
                message: "Could not process avatar image.",
                cause: "Sharp library failed to resize or save the image buffer.",
                valid_example: "Ensure the uploaded file is a valid image (JPG/PNG/WEBP)."
            };
        }
    }
};