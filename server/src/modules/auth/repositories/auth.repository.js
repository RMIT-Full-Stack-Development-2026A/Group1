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

        return User.findByIdAndUpdate(user._id, updates, { returnDocument: 'after' });
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
            { returnDocument: 'after' }
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
            { returnDocument: 'after' }
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
            { returnDocument: 'after' }
        );
    },

    updatePremiumExpiry: async (userId, premiumExpiresAt) => {
        return User.findByIdAndUpdate(
            userId,
            { $set: { premiumExpiresAt } },
            { returnDocument: 'after' }
        );
    },

    updateAccountStatus: async (userId, isActive) => {
        return User.findByIdAndUpdate(
            userId,
            { $set: { isActive } },
            { returnDocument: 'after' }
        );
    },

    updateUser: async (userId, updates) => {
        return User.findByIdAndUpdate(
            userId,
            { $set: updates },
            { returnDocument: 'after', runValidators: true }
        ).select('-passwordHash'); // Exclude password from the returned document
    },

    checkProfileConflicts: async (userId, email, username) => {
        const orConditions = [];
        if (email) orConditions.push({ email });
        if (username) orConditions.push({ username });

        if (orConditions.length === 0) return null;

        const conflict = await User.findOne({
            _id: { $ne: userId }, // Don't match the user who is currently updating
            $or: orConditions
        });

        if (conflict) {
            if (email && conflict.email === email) {
                return {
                    statusCode: 409,
                    error: "EMAIL_ALREADY_IN_USE",
                    message: "Profile update failed. Email is already registered.",
                    cause: "The provided email address is in use by another account.",
                    valid_example: "Provide a different email address."
                };
            }
            if (username && conflict.username === username) {
                return {
                    statusCode: 409,
                    error: "USERNAME_ALREADY_TAKEN",
                    message: "Profile update failed. Username is already taken.",
                    cause: "The provided username is claimed by another player.",
                    valid_example: "Provide a different, unique username."
                };
            }
        }
        return null; // No conflicts found
    },

    findUsersPaginated: async (filter, sort, skip, limit) => {
        const users = await User.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .select('-passwordHash'); // Ensure passwords are never leaked to admin dashboard

        const total = await User.countDocuments(filter);

        return { users, total };
    }
};