import { ProfileService } from '../services/profile.service.js';
import { ProfileDTO } from '../dtos/profile.dto.js';

export const ProfileController = {
    getProfile: async (req, res, next) => {
        try {
            const user = await ProfileService.getProfile(req.user.id);
            
            return res.status(200).json({
                data: ProfileDTO.toBaseProfile(user),
                message: "Profile fetched successfully."
            });
        } catch (error) {
            return next(error);
        }
    },

    getProfileOverview: async (req, res, next) => {
        try {
            const overviewData = await ProfileService.getProfileOverview(req.user.id);
            
            return res.status(200).json({
                data: ProfileDTO.toProfileOverview(overviewData),
                message: "Profile overview fetched successfully."
            });
        } catch (error) {
            return next(error);
        }
    },

    updateProfile: async (req, res, next) => {
        try {
            const updatedUser = await ProfileService.updateProfile(req.user.id, req.body);
            
            return res.status(200).json({
                data: ProfileDTO.toBaseProfile(updatedUser),
                message: "Profile updated successfully."
            });
        } catch (error) {
            return next(error);
        }
    }
};