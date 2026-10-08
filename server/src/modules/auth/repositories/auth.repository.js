import { Revenue } from "../models/platformMetric.model.js";
import { User } from "../models/user.model.js";

export const AuthRepository = {
    /** Finds user by email or username. */
    findByEmailOrUsername: async (identifier) => {
        const normalizedIdentifier = String(identifier).trim();
        return await User.findOne({
            $or: [
                { email: normalizedIdentifier.toLowerCase() },
                { username: normalizedIdentifier }
            ]
        }).select("+passwordHash +auth.loginAttempts +auth.lockUntil +auth.loginWindowStartedAt");
    },

    /** Creates a new user. */
    createUser: async (userData) => {
        const newUser = new User(userData);
        return await newUser.save();
    },

    /** Finds user by ID. */
    findById: async (id) => {
        return await User.findById(id);
    },

    findSessionUser: async (id) => User.findById(id).select('+auth.tokenVersion'),

    // Increment atomically so a new login invalidates every earlier session.
    startSession: async (userId) => User.findOneAndUpdate(
        { _id: userId, isActive: true, $or: [
            { 'auth.lockUntil': null }, { 'auth.lockUntil': { $lte: new Date() } }
        ] },
        { $inc: { 'auth.tokenVersion': 1 }, $set: {
            'auth.lastLoginAt': new Date(), 'auth.loginAttempts': 0,
            'auth.lockUntil': null, 'auth.loginWindowStartedAt': null
        } },
        { returnDocument: 'after' }
    ).select('+auth.tokenVersion'),

    // A delayed logout must not revoke a session issued by a newer login.
    revokeSession: async (userId, tokenVersion) => User.findOneAndUpdate(
        { _id: userId, ...(tokenVersion === 0
            ? { $or: [{ 'auth.tokenVersion': 0 }, { 'auth.tokenVersion': { $exists: false } }] }
            : { 'auth.tokenVersion': tokenVersion }) },
        { $inc: { 'auth.tokenVersion': 1 } },
        { returnDocument: 'after' }
    ).select('+auth.tokenVersion'),

    /** Finds user by ID including password. */
    findByIdWithPassword: async (id) => {
        return await User.findById(id).select("+passwordHash");
    },

    /** Increments login attempt count. */
    incrementLoginAttempts: async (user) => {
        const now = new Date();
        const freshWindow = { $gt: [
            { $ifNull: ['$auth.loginWindowStartedAt', new Date(0)] },
            new Date(now.getTime() - 60_000)
        ] };
        // Count in MongoDB, not from a possibly stale copy of the user document.
        return User.findByIdAndUpdate(user._id, [
            { $set: {
                'auth.loginAttempts': { $cond: [freshWindow, { $add: [{ $ifNull: ['$auth.loginAttempts', 0] }, 1] }, 1] },
                'auth.loginWindowStartedAt': { $cond: [freshWindow, '$auth.loginWindowStartedAt', now] }
            } },
            { $set: { 'auth.lockUntil': { $cond: [
                { $gt: ['$auth.lockUntil', now] }, '$auth.lockUntil',
                { $cond: [{ $gte: ['$auth.loginAttempts', 5] }, new Date(now.getTime() + 60_000), null] }
            ] } } }
        ], { returnDocument: 'after', updatePipeline: true })
            .select('+auth.loginAttempts +auth.lockUntil');
    },

    /** Updates premium expiration. */
    updatePremiumExpiry: async (userId, premiumExpiresAt) => {
        return await User.findByIdAndUpdate(
            userId,
            { $set: { premiumExpiresAt } },
            { returnDocument: 'after' }
        );
    },

    /** Updates account status. */
    updateAccountStatus: async (userId, isActive) => {
        return await User.findByIdAndUpdate(
            userId,
            { $set: { isActive }, ...(!isActive && { $inc: { 'auth.tokenVersion': 1 } }) },
            { returnDocument: 'after' }
        );
    },

    /** Updates generic user fields. */
    updateUser: async (userId, updates) => {
        return await User.findByIdAndUpdate(
            userId,
            { $set: updates },
            { returnDocument: 'after', runValidators: true }
        ).select('-passwordHash');
    },

    /** Updates user password. */
    updatePassword: async (userId, passwordHash) => {
        return await User.findByIdAndUpdate(
            userId,
            { $set: { passwordHash }, $inc: { 'auth.tokenVersion': 1 } },
            { returnDocument: 'after' }
        ).select('+auth.tokenVersion');
    },

    /** Validates profile uniqueness. */
    checkProfileConflicts: async (userId, email, username) => {
        const orConditions = [];
        if (email) orConditions.push({ email });
        if (username) orConditions.push({ username });

        if (orConditions.length === 0) return null;

        const conflict = await User.findOne({
            _id: { $ne: userId },
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
        return null;
    },

    /** Increments total revenue. */
    incrementPlatformRevenue: async (amount) => {
        return await Revenue.findOneAndUpdate(
            { singletonId: 'GLOBAL_METRICS' },
            { $inc: { totalRevenue: amount } },
            { upsert: true, returnDocument: true }
        );
    },

    /** Retrieves global metrics. */
    getPlatformMetrics: async () => {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));

        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

        const [totalPlayers, activePlayers, premiumPlayers, todayAgg, weekAgg, monthAgg] = await Promise.all([
            User.countDocuments({ role: 'PLAYER' }),
            User.countDocuments({ role: 'PLAYER', isActive: true }),
            User.countDocuments({ role: 'PLAYER', premiumExpiresAt: { $gt: new Date() } }),
            
            User.aggregate([
                { $match: { role: 'PLAYER', createdAt: { $gte: startOfDay } } },
                { $group: { _id: { $hour: "$createdAt" }, count: { $sum: 1 } } }
            ]),
            
            User.aggregate([
                { $match: { role: 'PLAYER', createdAt: { $gte: startOfWeek } } },
                { $group: { _id: { $dayOfWeek: "$createdAt" }, count: { $sum: 1 } } }
            ]),
            
            User.aggregate([
                { $match: { role: 'PLAYER', createdAt: { $gte: startOfMonth } } },
                { $group: { _id: { $dayOfMonth: "$createdAt" }, count: { $sum: 1 } } }
            ])
        ]);

        const registeredToday = Array(24).fill(0);
        todayAgg.forEach(item => { registeredToday[item._id] = item.count; });

        const registeredThisWeek = Array(7).fill(0);
        weekAgg.forEach(item => {
            const index = item._id === 1 ? 6 : item._id - 2;
            registeredThisWeek[index] = item.count;
        });

        const registeredThisMonth = Array(daysInMonth).fill(0);
        monthAgg.forEach(item => { registeredThisMonth[item._id - 1] = item.count; });

        return { 
            totalPlayers, activePlayers, premiumPlayers, 
            registeredToday, registeredThisWeek, registeredThisMonth, 
        };
    },
    
    /** Retrieves paginated users. */
    findUsersPaginated: async (filter, sort, skip, limit) => {
        const users = await User.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .select('-passwordHash');

        const total = await User.countDocuments(filter);

        return { users, total };
    }
};
