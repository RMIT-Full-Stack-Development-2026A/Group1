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
            const saftUpdatedProfile = await ProfileService.updateProfile(req.user.id, req.body);
            
            return res.status(200).json({
                data: saftUpdatedProfile,
                message: "Profile updated successfully."
            });
        } catch (error) {
            return next(error);
        }
    }
};