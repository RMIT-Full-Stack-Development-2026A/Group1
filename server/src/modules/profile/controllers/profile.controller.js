import { ProfileService } from '../services/profile.service.js';
import { upload } from '../../../config/multer.config.js';
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

    uploadAvatar: (req, res, next) => {
        // Execute multer middleware inside the controller to catch its specific errors
        upload.single('avatar')(req, res, async (err) => {
            // 1. Handle Multer-specific errors first
            if (err) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({
                        statusCode: 400,
                        error: "FILE_TOO_LARGE",
                        message: "Avatar upload failed. File is too heavy.",
                        cause: "The uploaded file exceeds the 2MB limit.",
                        valid_example: "Compress your image or choose a file under 2MB."
                    });
                }
                if (err.code === 'INVALID_FILE_TYPE') {
                    return res.status(400).json({
                        statusCode: 400,
                        error: "UNSUPPORTED_FILE_TYPE",
                        message: err.message,
                        cause: "Only JPG, PNG, and WEBP formats are supported.",
                        valid_example: "image.jpg, image.png, image.webp"
                    });
                }
                return next(err);
            }

            // 2. Proceed with business logic if file passes multer validation
            try {
                if (!req.file) {
                    throw {
                        statusCode: 400,
                        error: "BAD_REQUEST",
                        message: "No file uploaded.",
                        cause: "The request body did not contain a file field named 'avatar'."
                    };
                }

                // Delegate to Service layer
                const safeUpdatedProfile = await ProfileService.uploadAvatar(req.user.id, req.file);
                
                return res.status(200).json({
                    data: safeUpdatedProfile,
                    message: "Avatar uploaded and updated successfully."
                });

            } catch (error) {
                return next(error);
            }
        });
    }
};