import { User } from "../models/user.model.js";

// Repository owns direct database access for auth-related user operations.
export const AuthRepository = {
    findByEmailOrUsername: async (identifier) => {
        const normalizedIdentifier = String(identifier).trim();

        return User.findOne({
            $or: [
                { email: normalizedIdentifier.toLowerCase() },
                { username: normalizedIdentifier }
            ]
        }).select("+passwordHash");
    },

    existsByEmail: async (email) => {
        const normalizedEmail = String(email).trim().toLowerCase();
        return !!(await User.exists({ email: normalizedEmail }));
    },

    existsByUsername: async (username) => {
        const normalizedUsername = String(username).trim();
        return !!(await User.exists({ username: normalizedUsername }));
    },

    createUser: async (userData) => {
        const newUser = new User(userData);
        return newUser.save();
    },

    findById: async (id) => {
        return User.findById(id);
    },

    findByIdWithPassword: async (id) => {
        return User.findById(id).select("+passwordHash");
    },

    incrementLoginAttempts: async (user) => {
        const currentAttempts = user?.auth?.loginAttempts || 0;
        const updates = {
            $inc: { "auth.loginAttempts": 1 }
        };

        if (currentAttempts + 1 >= 5) {
            updates.$set = { "auth.lockUntil": new Date(Date.now() + 60 * 1000) };
        }

        return User.findByIdAndUpdate(user._id, updates, { new: true });
    },

    resetLoginAttempts: async (userId) => {
        return User.findByIdAndUpdate(
            userId,
            {
                $set: {
                    "auth.loginAttempts": 0,
                    "auth.lockUntil": null
                }
            },
            { new: true }
        );
    },

    clearExpiredLock: async (userId) => {
        return User.findByIdAndUpdate(
            userId,
            {
                $set: {
                    "auth.loginAttempts": 0,
                    "auth.lockUntil": null
                }
            },
            { new: true }
        );
    },

    updateLastLogin: async (userId) => {
        return User.findByIdAndUpdate(
            userId,
            {
                $set: {
                    "auth.lastLoginAt": new Date()
                }
            },
            { new: true }
        );
    },

    updatePremiumExpiry: async (userId, premiumExpiresAt) => {
        return User.findByIdAndUpdate(
            userId,
            { $set: { premiumExpiresAt } },
            { new: true }
        );
    },

    updateAccountStatus: async (userId, isActive) => {
        return User.findByIdAndUpdate(
            userId,
            { $set: { isActive } },
            { new: true }
        );
    }
};