// import { ProfileService } from "../services/profile.service.js";
import { ProfileDTO } from "../dtos/profile.dto.js";

// Interface exposes profile module use-cases to controllers or other modules.
export const ProfileInterface = {
    getCurrentProfile: async (userId) => {
        // const user = await ProfileService.getCurrentProfile(userId);
        // if (!user) return null;

        // return ProfileDTO.toBaseProfile(user);
    },

    getProfileOverview: async (userId) => {
        // const result = await ProfileService.getProfileOverview(userId);
        // if (!result) return null;

        // return ProfileDTO.toProfileOverview(result);
    },

    updateProfile: async (userId, payload) => {
       //  const user = await ProfileService.updateProfile(userId, payload);
        // if (!user) return null;

        // return ProfileDTO.toBaseProfile(user);
    },

    changePassword: async (userId, payload) => {
        // return ProfileService.changePassword(userId, payload);
    },

    uploadAvatar: async (userId, file) => {
        // const avatarUrl = await ProfileService.uploadAvatar(userId, file);
        // return ProfileDTO.toAvatarUploadResponse(avatarUrl);
    }
};