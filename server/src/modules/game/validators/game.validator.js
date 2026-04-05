import mongoose from 'mongoose';

export const validateObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const validateGameCreation = (data) => {
    const errors = [];
    const validGameTypes = ['SINGLE_PLAYER', 'TWO_PLAYERS']; // Online handled internally
    const validStatuses = ['FINISHED', 'DRAW', 'ABORTED'];

    if (!validGameTypes.includes(data.gameType)) {
        errors.push({ field: "gameType", error: "INVALID_GAME_TYPE", cause: "Must be SINGLE_PLAYER or TWO_PLAYERS." });
    }
    if (![10, 15].includes(data.boardSize)) {
        errors.push({ field: "boardSize", error: "INVALID_BOARD_SIZE", cause: "Must be 10 or 15." });
    }
    if (!validStatuses.includes(data.status)) {
        errors.push({ field: "status", error: "INVALID_STATUS", cause: "Must be FINISHED, DRAW, or ABORTED." });
    }
    if (!Array.isArray(data.participants) || data.participants.length !== 2) {
        errors.push({ field: "participants", error: "INVALID_PARTICIPANTS", cause: "Must have exactly 2 participants." });
    }
    
    return errors;
};

export const validateGameQuery = (userId, query) => {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter = { 'participants.userId': userId }; // Force filtering by requesting user

    if (query.gameType) filter.gameType = query.gameType;
    if (query.status) filter.status = query.status;

    if (query.q) {
        filter.$or = [
            { sessionNumber: { $regex: query.q, $options: 'i' } },
            { 'participants.usernameSnapshot': { $regex: query.q, $options: 'i' } }
        ];
    }

    if (query.from || query.to) {
        filter.endedAt = {};
        if (query.from) filter.endedAt.$gte = new Date(query.from);
        if (query.to) filter.endedAt.$lte = new Date(query.to);
    }

    const sort = query.sortBy === 'startedAt' 
        ? { startedAt: query.sortOrder === 'asc' ? 1 : -1 } 
        : { endedAt: query.sortOrder === 'asc' ? 1 : -1 }; // default sort by endedAt descending

    return { filter, sort, pagination: { page, limit, skip } };
};