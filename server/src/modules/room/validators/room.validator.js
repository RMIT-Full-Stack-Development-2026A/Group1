import mongoose from 'mongoose';

export const validateObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};

export const validateRoomQuery = (query) => {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.max(1, Math.min(50, parseInt(query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter = {};

    if (query.status) {
        if (['WAITING', 'READY', 'PLAYING'].includes(query.status)) {
            filter.status = query.status;
        }
    } else {
        // Default arena filter
        filter.status = { $in: ['WAITING', 'READY', 'PLAYING'] };
    }

    if (query.boardSize && [10, 15].includes(parseInt(query.boardSize))) {
        filter.boardSize = parseInt(query.boardSize);
    }

    // Sort newest created first for arena listings
    const sort = { createdAt: -1 };

    return { filter, sort, pagination: { page, limit, skip } };
};