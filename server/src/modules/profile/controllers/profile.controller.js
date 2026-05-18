import { ProfileService } from '../services/profile.service.js';
import { upload } from '../../../config/multer.config.js';

export const ProfileController = {
    // [GET] /profile endpoint
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

    // [GET] /profile/overview endpoint
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

    // [PUT] /profile/update endpoint
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

    // [POST] /profile/avatar endpoint
    uploadAvatar: async (req, res, next) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    error: "BAD_REQUEST",
                    message: "No file uploaded.",
                    cause: "The request body did not contain a file field named 'avatar'.",
                    valid_example: "Ensure your form-data contains an 'avatar' file field."
                });
            }

            // Controller -> Service layer
            const safeUpdatedProfile = await ProfileService.uploadAvatar(req.user.id, req.file);
            
            return res.status(200).json({
                data: safeUpdatedProfile,
                message: "Avatar uploaded and updated successfully."
            });
        } catch (error) {
            return next(error);
        }
    }, 

    // [PATCH] /profile/password endpoint
    changePassword: async (req, res, next) => {
        try {
            await ProfileService.changePassword(req.user.id, req.body);
            
            return res.status(200).json({
                data: null,
                message: "Password changed successfully."
            });
        } catch (error) {
            return next(error);
        }
    }
};