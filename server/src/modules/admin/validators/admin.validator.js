import mongoose from 'mongoose';

// Define constants 
export const ACTIVE_ROOM_STATUSES = ['WAITING', 'READY', 'PLAYING'];
export const ALL_ROOM_STATUSES = [...ACTIVE_ROOM_STATUSES, 'ABORTED', 'CLOSED'];

/**
 * Validates MongoDB ObjectId format.
 * @param {string} id - Identifier to check.
 * @returns {boolean} True if valid.
 */
export const validateObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};

/**
 * Validates and sanitizes player query parameters.
 * @param {Object} query - Request query object.
 * @returns {Object} Structured filter, sort, and pagination payload.
 */
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
        // Simple regex search for email/username
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

/**
 * Validates and sanitizes room query parameters.
 * @param {Object} query - Request query object.
 * @returns {Object} Structured filter, sort, and pagination payload.
 */
export const validateAdminRoomQuery = (query) => {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(query.limit) || 20)); 
    const skip = (page - 1) * limit;

    const filter = {};
    
    // Status Filter
    if (query.status) {
        const status = String(query.status).toUpperCase();
        
        if (status !== 'ACTIVE' && !ALL_ROOM_STATUSES.includes(status)) {
            throw {
                statusCode: 400,
                error: "INVALID_STATUS",
                message: "Invalid room status parameter.",
                cause: `The provided status is not recognized. Allowed values are: ACTIVE, ${ALL_ROOM_STATUSES.join(', ')}.`,
                valid_example: "ACTIVE"
            };
        }
        filter.status = status === 'ACTIVE' ? { $in: ACTIVE_ROOM_STATUSES } : status;
    } else {
        // Default to active rooms for monitoring
        filter.status = { $in: ACTIVE_ROOM_STATUSES };
    }

    // Board Size Filter
    if (query.boardSize) {
        const size = parseInt(query.boardSize, 10);
        if (![10, 15].includes(size)) {
            throw {
                statusCode: 400,
                error: "INVALID_BOARD_SIZE",
                message: "Invalid board size parameter.",
                cause: "The provided board size is unsupported.",
                valid_example: "15"
            };
        }
        filter.boardSize = size;
    }

    // Sort newest first
    const sort = { createdAt: -1 };

    return { filter, sort, pagination: { page, limit, skip } };
};

/**
 * Validates and sanitizes the room monitoring game history query.
 * @param {Object} query - Request query object.
 * @returns {Object} Structured filter and pagination payload.
 */
export const validateAdminPlayerGameQuery = (query) => {
    const page = Math.max(1, parseInt(query.page) || 1);
    // Force a higher default limit (300) for room monitoring, max 300.
    const limit = Math.max(1, Math.min(300, parseInt(query.limit) || 300)); 
    const skip = (page - 1) * limit;

    return {
        filter: { gameType: 'ONLINE_MATCH' },
        pagination: { page, limit, skip }
    };
};