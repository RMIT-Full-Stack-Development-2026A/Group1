import { User } from "../models/user.model.js";

// Repository owns direct database access for auth-related user operations.
export const AuthRepository = {
    findByEmailOrUsername: async (identifier) => {
        const normalizedIdentifier = String(identifier).trim();

        return await User.findOne({
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
        return await newUser.save();
    },

    findById: async (id) => {
        return await User.findById(id);
    },

    findByIdWithPassword: async (id) => {
        return await User.findById(id).select("+passwordHash");
    },

    incrementLoginAttempts: async (user) => {
        const currentAttempts = user?.auth?.loginAttempts || 0;
        const updates = {
            $inc: { "auth.loginAttempts": 1 }
        };

        if (currentAttempts + 1 >= 5) {
            updates.$set = { "auth.lockUntil": new Date(Date.now() + 60 * 1000) };
        }

        return await User.findByIdAndUpdate(user._id, updates, { returnDocument: 'after' });
    },

    resetLoginAttempts: async (userId) => {
        return await User.findByIdAndUpdate(
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
        return await User.findByIdAndUpdate(
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
        return await User.findByIdAndUpdate(
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
        return await User.findByIdAndUpdate(
            userId,
            { $set: { premiumExpiresAt } },
            { returnDocument: 'after' }
        );
    },

    updateAccountStatus: async (userId, isActive) => {
        return await User.findByIdAndUpdate(
            userId,
            { $set: { isActive } },
            { returnDocument: 'after' }
        );
    },

    updateUser: async (userId, updates) => {
        return await User.findByIdAndUpdate(
            userId,
            { $set: updates },
            { returnDocument: 'after', runValidators: true }
        ).select('-passwordHash'); // Exclude password from the returned document
    },

    updatePassword: async (userId, passwordHash) => {
        return await User.findByIdAndUpdate(
            userId,
            { $set: { passwordHash } },
            { returnDocument: 'after' }
        );
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

    getPlatformMetrics: async () => {
        const now = new Date();
        
        // Time Boundaries
        const startOfToday = new Date(now);
        startOfToday.setHours(0, 0, 0, 0);

        const startOfWeek = new Date(startOfToday);
        const day = startOfWeek.getDay(); 
        // JS getDay() is 0 (Sun) to 6 (Sat)
        const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
        startOfWeek.setDate(diff);

        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Calculate days in the current month (28, 29, 30, or 31)
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

        // Execute queries concurrently 
        const [totalPlayers, activePlayers, premiumPlayers, todayAgg, weekAgg, monthAgg] = await Promise.all([
            User.countDocuments({ role: 'PLAYER' }),
            User.countDocuments({ role: 'PLAYER', isActive: true }),
            User.countDocuments({ role: 'PLAYER', premiumExpiresAt: { $gt: now } }),
            
            // Today (Group by Hour: 0-23)
            User.aggregate([
                { $match: { role: 'PLAYER', createdAt: { $gte: startOfToday } } },
                { $group: { _id: { $hour: "$createdAt" }, count: { $sum: 1 } } }
            ]),
            
            // This Week (Group by Day of Week: 1=Sun ... 7=Sat)
            User.aggregate([
                { $match: { role: 'PLAYER', createdAt: { $gte: startOfWeek } } },
                { $group: { _id: { $dayOfWeek: "$createdAt" }, count: { $sum: 1 } } }
            ]),
            
            // This Month (Group by Day of Month: 1 to 31)
            User.aggregate([
                { $match: { role: 'PLAYER', createdAt: { $gte: startOfMonth } } },
                { $group: { _id: { $dayOfMonth: "$createdAt" }, count: { $sum: 1 } } }
            ])
        ]);

        // Format the arrays
        // Today: Array of 24 hours [0, 0, ..., 0]
        const registeredToday = Array(24).fill(0);
        todayAgg.forEach(item => {
            registeredToday[item._id] = item.count;
        });

        // This Week: Array of 7 days (Monday -> Sunday)
        const registeredThisWeek = Array(7).fill(0);
        weekAgg.forEach(item => {
            const index = item._id === 1 ? 6 : item._id - 2;
            registeredThisWeek[index] = item.count;
        });

        // This Month: Array of X days based on current month
        const registeredThisMonth = Array(daysInMonth).fill(0);
        monthAgg.forEach(item => {
            registeredThisMonth[item._id - 1] = item.count;
        });

        return { totalPlayers, activePlayers, premiumPlayers, registeredToday, registeredThisWeek, registeredThisMonth };
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