import sharp from 'sharp';
import cloudinary from '../../../config/cloudinary.config.js';
import { AuthInterface } from '../../auth/interfaces/auth.interface.js';
import { GameInterface } from '../../game/interfaces/game.interface.js';
import { ProfileDTO } from '../dtos/profile.dto.js'
import { validateProfileUpdate, validatePasswordChange } from '../validators/profile.validator.js';
import { getPublicIdFromUrl } from '../utils/getImageUrl.js';

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
        try {
            // 1. Fetch current user to get the OLD avatar URL before overwriting it
            const currentUser = await AuthInterface.getUserById(userId);
            const oldAvatarUrl = currentUser?.avatar;

            // 2. Process image with sharp: resize and convert to webp
            const processedImageBuffer = await sharp(file.buffer)
                .resize(200, 200, { fit: 'cover' })
                .webp({ quality: 80 })
                .toBuffer();

            // 3. Upload to Cloudinary using Promise wrapper for upload_stream
            const uploadToCloudinary = (buffer) => {
                return new Promise((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        {
                            folder: 'avatars', 
                            public_id: `user-${userId}-${Date.now()}`,
                            resource_type: 'image'
                        },
                        (error, result) => {
                            if (error) return reject(error);
                            resolve(result);
                        }
                    );
                    uploadStream.end(buffer);
                });
            };

            const cloudinaryResult = await uploadToCloudinary(processedImageBuffer);
            const newAvatarUrl = cloudinaryResult.secure_url;

            // 4. CLEANUP: Delete the old avatar from Cloudinary (fire-and-forget)
            if (oldAvatarUrl && oldAvatarUrl.includes('cloudinary')) {
                const oldPublicId = getPublicIdFromUrl(oldAvatarUrl);
                if (oldPublicId) {
                    cloudinary.uploader.destroy(oldPublicId).catch(err => {
                        console.error(`[Cloudinary] Failed to delete old avatar ${oldPublicId}:`, err);
                    });
                }
            }

            // 5. Update user profile in the database with the new secure URL
            const updatedUser = await AuthInterface.updateUserProfile(userId, { avatar: newAvatarUrl });
            
            return ProfileDTO.toBaseProfile(updatedUser);

        } catch (error) {
            console.error('[Avatar Upload Error]', error);
            throw {
                statusCode: 500,
                error: "UPLOAD_FAILED",
                message: "Could not process or upload avatar image.",
                cause: error.message || "Internal error during Sharp processing or Cloudinary upload.",
                valid_example: "Ensure your API keys are correct and the image is valid."
            };
        }
    }, 

    changePassword: async (userId, passwordData) => {
        const validationErrors = validatePasswordChange(passwordData);
        if (validationErrors.length > 0) {
            throw {
                statusCode: 400,
                error: "VALIDATION_ERROR",
                message: "Invalid password change request.",
                cause: "Passwords do not match or fail complexity requirements.",
                valid_example: "Ensure old password is correct, and new password matches the confirm password field.",
                details: validationErrors
            };
        }

        // Delegate to Auth module to handle bcrypt verification and hashing
        await AuthInterface.changePassword(userId, passwordData.oldPassword, passwordData.newPassword);
        
        return null;
    }
};