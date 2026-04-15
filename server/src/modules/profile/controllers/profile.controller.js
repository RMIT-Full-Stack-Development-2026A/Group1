import { ProfileService } from '../services/profile.service.js';

export const ProfileController = {
    getProfile: async (req, res, next) => {
        try {
            const safeProfile = await ProfileService.getProfile(req.user.id);
            
            return res.status(200).json({
                data: safeProfile,
                message: "Profile fetched successfully."
            });
        } catch (error) {
            return next(error);
        }
    },

    getProfileOverview: async (req, res, next) => {
        try {
            const safeOverview = await ProfileService.getProfileOverview(req.user.id);
            
            return res.status(200).json({
                data: safeOverview,
                message: "Profile overview fetched successfully."
            });
        } catch (error) {
            return next(error);
        }
    },

    updateProfile: async (req, res, next) => {
        try {
            const safeUpdatedProfile = await ProfileService.updateProfile(req.user.id, req.body);
            
            return res.status(200).json({
                data: safeUpdatedProfile,
                message: "Profile updated successfully."
            });
        } catch (error) {
            return next(error);
        }
    },

    uploadAvatar: async (req, res, next) => {
        try {
            // If no file
            if (!req.file) {
                throw {
                    statusCode: 400,
                    error: "BAD_REQUEST",
                    message: "No file uploaded.",
                    cause: "The request body did not contain a file field named 'avatar'."
                };
            }

            const safeUpdatedProfile = await ProfileService.uploadAvatar(req.user.id, req.file);
            
            return res.status(200).json({
                data: safeUpdatedProfile,
                message: "Avatar uploaded and resized successfully."
            });

        } catch (error) {
            // Exceed file size limit
            if (error.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    statusCode: 400,
                    error: "FILE_TOO_LARGE",
                    message: "Avatar upload failed. File is too heavy.",
                    cause: "The uploaded file exceeds the 2MB limit.",
                    valid_example: "Compress your image or choose a file under 2MB."
                });
            }

            // Invalid file type
            if (error.code === 'INVALID_FILE_TYPE') {
                return res.status(400).json({
                    statusCode: 400,
                    error: "UNSUPPORTED_FILE_TYPE",
                    message: error.message,
                    cause: "Only JPG, PNG, and WEBP formats are supported.",
                    valid_example: "image.jpg, image.png, image.webp"
                });
            }

            return next(error);
        }
    }
};