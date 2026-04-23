import mongoose from 'mongoose';
import { ALL_ROOM_STATUSES, ACTIVE_ROOM_STATUSES } from '../constants/room.constants.js';

export const validateObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};

export const validateRoomQuery = (query) => {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter = {};

    // Filter by board size
    if (query.boardSize) {
        const size = parseInt(query.boardSize, 10);
        if ([10, 15].includes(size)) {
            filter.boardSize = size;
        } else {
            throw {
                statusCode: 400,
                error: "INVALID_QUERY",
                message: "Invalid boardSize parameter.",
                valid_example: "boardSize must be either 10 or 15."
            };
        }
    }

    // Filter by status using your centralized constants
    if (query.status) {
        const upperStatus = query.status.toUpperCase();
        
        if (ALL_ROOM_STATUSES.includes(upperStatus)) {
            filter.status = upperStatus;
        } else if (upperStatus === 'ACTIVE') {
            // Helper query
            filter.status = { $in: ACTIVE_ROOM_STATUSES };
        } else {
            throw {
                statusCode: 400,
                error: "INVALID_QUERY",
                message: "Invalid status parameter.",
                valid_example: `Status must be 'ACTIVE' or one of: ${ALL_ROOM_STATUSES.join(', ')}`
            };
        }
    } else {
        filter.status = { $in: ACTIVE_ROOM_STATUSES };
    }

    // Sort newest created first for arena listings
    const sort = { createdAt: -1 };

    return { filter, sort, pagination: { page, limit, skip } };
};