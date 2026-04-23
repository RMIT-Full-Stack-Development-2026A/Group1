import mongoose from 'mongoose';
import { ALL_ROOM_STATUSES, ACTIVE_ROOM_STATUSES } from '../constants/room.constants.js';

export const validateObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};

export const validateRoomQuery = (query = {}, requestingUser = {}) => {
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

    const isAdmin = requestingUser.role === 'ADMIN';
    if (query.status) {
        const upperStatus = query.status.toUpperCase();
        
        if (upperStatus === 'ACTIVE') {
            filter.status = { $in: ACTIVE_ROOM_STATUSES };
        } else if (ACTIVE_ROOM_STATUSES.includes(upperStatus)) {
            // Anyone can query specific active statuses (WAITING, READY, PLAYING)
            filter.status = upperStatus;
        } else if (isAdmin && ALL_ROOM_STATUSES.includes(upperStatus)) {
            // ONLY Admins can query terminal statuses (CLOSED, ABORTED)
            filter.status = upperStatus;
        } else {
            throw {
                statusCode: isAdmin ? 400 : 403,
                error: isAdmin ? "INVALID_QUERY" : "FORBIDDEN_STATUS_QUERY",
                message: isAdmin ? "Invalid status parameter." : "You do not have permission to query closed or aborted rooms.",
                valid_example: isAdmin 
                    ? `Admin allowed statuses: 'ACTIVE' or ${ALL_ROOM_STATUSES.join(', ')}`
                    : `Allowed statuses: 'ACTIVE' or ${ACTIVE_ROOM_STATUSES.join(', ')}`
            };
        }
    } else {
        filter.status = { $in: ACTIVE_ROOM_STATUSES };
    }

    // Sort newest created first for arena listings
    const sort = { createdAt: -1 };

    return { filter, sort, pagination: { page, limit, skip } };
};