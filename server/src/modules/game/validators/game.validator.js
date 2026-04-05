import mongoose from 'mongoose';

export const validateObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const validateGameCreation = (payload) => {
    const errors = [];

    if (!payload || typeof payload !== 'object') {
        errors.push("Request body is missing or invalid.");
        return errors;
    }

    // This endpoint not support ONLINE_MATCH 
    if (payload.gameType === 'ONLINE_MATCH') {
        errors.push("Cannot save 'ONLINE_MATCH' via this endpoint. Online matches are automatically saved by the server when the room closes.");
    }

    // Strict Enum Check
    if (!['SINGLE_PLAYER', 'TWO_PLAYERS'].includes(payload.gameType)) {
        errors.push("gameType must be 'SINGLE_PLAYER' or 'TWO_PLAYERS'.");
    }
    if (!['FINISHED', 'DRAW', 'ABORTED'].includes(payload.status)) {
        errors.push("status must be 'FINISHED', 'DRAW', or 'ABORTED'.");
    }

    if (payload.status === 'FINISHED') {
        if (payload.winnerParticipantIndex !== 0 && payload.winnerParticipantIndex !== 1) {
            errors.push("A finished match must have a valid winnerParticipantIndex (0 or 1).");
        }
        if (!Array.isArray(payload.winningLine) || payload.winningLine.length !== 5) {
            errors.push("A finished match must include a winningLine array containing exactly 5 coordinates.");
        }
    }

    // Check participants array
    if (!Array.isArray(payload.participants) || payload.participants.length !== 2) {
        errors.push("participants array must contain exactly 2 objects.");
    }

    if (payload.firstTurnParticipantIndex !== 0 && payload.firstTurnParticipantIndex !== 1) {
        errors.push("firstTurnParticipantIndex must be either 0 or 1.");
    }

    //  Check moves array if provided (for replay purposes)
    if (payload.moves && !Array.isArray(payload.moves)) {
        errors.push("moves must be a valid array if provided.");
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