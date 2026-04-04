import mongoose from 'mongoose';

export const validateObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};

export const validatePlayerQuery = (query) => {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(query.limit) || 20)); // Limit at 100
    const skip = (page - 1) * limit;

    // Only select PLAYER role
    const filter = { role: 'PLAYER' };
    
    // Status Filter
    if (query.status === 'ACTIVE') filter.isActive = true;
    if (query.status === 'INACTIVE') filter.isActive = false;

    // Premium Filter
    if (query.premium === 'true') filter.premiumExpiresAt = { $gt: new Date() };
    if (query.premium === 'false') filter.premiumExpiresAt = { $lte: new Date() };

    // Search Query
    if (query.q) {
        // Simple regex search for email/username (Fallback if text search isn't sufficient)
        filter.$or = [
            { username: { $regex: query.q, $options: 'i' } },
            { email: { $regex: query.q, $options: 'i' } }
        ];
    }

    // Sorting 
    const allowedSortFields = ['createdAt', 'username', 'lastLoginAt'];
    const sortBy = allowedSortFields.includes(query.sortBy) ? query.sortBy : 'createdAt';
    const sortOrder = query.sortOrder === 'asc' ? 1 : -1;
    const sort = { [sortBy]: sortOrder };

    return { filter, sort, pagination: { page, limit, skip } };
};