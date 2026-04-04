import { AuthDTO } from "../dtos/auth.dto.js";
import { AuthRepository } from "../repositories/auth.repository.js";

// Interface exposes auth-owned user operations to other modules without leaking repository details.
export const AuthInterface = {
    getUserStatus: async (userId) => {
        const user = await AuthRepository.findById(userId);
        if (!user) return null;

        return AuthDTO.toUserResponse(user);
    },
    getUserSessionContext: async (userId) => {
        const user = await AuthRepository.findById(userId);
        if (!user) return null;

        return {
            id: user.id || user._id,
            role: user.role,
            isPremium: user.isPremium,
            isActive: user.isActive
        };
    },
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

    // Expose data for Profile module
    getUserById: async (userId) => {
        return AuthRepository.findById(userId);
    },
    updateUserProfile: async (userId, updates) => {
        return AuthRepository.updateUser(userId, updates);
    },
    checkProfileConflicts: async (userId, email, username) => {
        return AuthRepository.checkProfileConflicts(userId, email, username);
    },

    // Expose data for Admin module
    getPaginatedUsers: async (filter, sort, skip, limit) => {
        return AuthRepository.findUsersPaginated(filter, sort, skip, limit);
    }
};