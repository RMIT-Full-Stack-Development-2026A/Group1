import { AuthService } from "../services/auth.service.js";

// Interface exposes auth-owned user operations to other modules without leaking repository details.
export const AuthInterface = {
    getUserStatus: async (userId) => AuthService.getUserStatus(userId),
    
    getUserSessionContext: async (userId) => AuthService.getUserSessionContext(userId),
    
    setPremiumExpiry: async (userId, premiumExpiresAt) => AuthService.setPremiumExpiry(userId, premiumExpiresAt),
    
    setAccountStatus: async (userId, isActive) => AuthService.setAccountStatus(userId, isActive),

    // Expose data for Profile module
    getUserById: async (userId) => AuthService.getUserById(userId),
    
    updateUserProfile: async (userId, updates) => AuthService.updateUserProfile(userId, updates),
    
    checkProfileConflicts: async (userId, email, username) => AuthService.checkProfileConflicts(userId, email, username),

    changePassword: async (userId, oldPassword, newPassword) => AuthService.changePassword(userId, oldPassword, newPassword),

    // Expose data for Admin module
    getPaginatedUsers: async (filter, sort, skip, limit) => AuthService.getPaginatedUsers(filter, sort, skip, limit)
};