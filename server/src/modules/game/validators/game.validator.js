import mongoose from 'mongoose';

export const validateObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const validateGameCreation = (payload) => {
    const errors = [];

    if (!payload || typeof payload !== 'object') {
        errors.push({ field: "payload", error: "INVALID_BODY", cause: "Request body is missing or invalid." });
        return errors;
    }

    if (payload.gameType === 'ONLINE_MATCH') {
        errors.push({ field: "gameType", error: "INVALID_GAME_TYPE", cause: "Cannot save 'ONLINE_MATCH' via this endpoint." });
    }

    if (!['SINGLE_PLAYER', 'TWO_PLAYERS'].includes(payload.gameType)) {
        errors.push({ field: "gameType", error: "INVALID_GAME_TYPE", cause: "Must be 'SINGLE_PLAYER' or 'TWO_PLAYERS'." });
    }

    // Check board size
    if (payload.boardSize && ![10, 15].includes(payload.boardSize)) {
        errors.push({ field: "boardSize", error: "INVALID_BOARD_SIZE", cause: "Must be 10 or 15." });
    }

    if (!['FINISHED', 'DRAW', 'ABORTED'].includes(payload.status)) {
        errors.push({ field: "status", error: "INVALID_STATUS", cause: "Must be 'FINISHED', 'DRAW', or 'ABORTED'." });
    }

    if (payload.status === 'FINISHED') {
       if (payload.winnerParticipantIndex !== 0 && payload.winnerParticipantIndex !== 1) {
            errors.push({ field: "winnerParticipantIndex", error: "INVALID_WINNER", cause: "Must have a valid winnerParticipantIndex (0 or 1)." });
        }
        if (!Array.isArray(payload.winningLine) || payload.winningLine.length !== 5) {
            errors.push({ field: "winningLine", error: "INVALID_WINNING_LINE", cause: "Finished match must include exactly 5 coordinates." });
        }
    }

    if (!Array.isArray(payload.participants) || payload.participants.length !== 2) {
        errors.push({ field: "participants", error: "INVALID_PARTICIPANTS", cause: "Must contain exactly 2 objects." });
    }

    if (payload.firstTurnParticipantIndex !== 0 && payload.firstTurnParticipantIndex !== 1) {
        errors.push({ field: "firstTurnParticipantIndex", error: "INVALID_FIRST_TURN", cause: "Must be either 0 or 1." });
    }

    if (payload.moves && !Array.isArray(payload.moves)) {
        errors.push({ field: "moves", error: "INVALID_MOVES", cause: "Must be a valid array." });
    }

    return errors;
};

export const validateGameQuery = (userId, query) => {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter = { 'participants.userId': userId }; // Force filtering by requesting user

    if (query.gameType) filter.gameType = query.gameType;
    
    // Handle status and result filtering
    if (query.status) {
        filter.status = query.status;
    }
    
    if (query.result) {
        // Map result types to status filters
        if (query.result === 'DRAW') {
            filter.status = 'DRAW';
        } else if (query.result === 'ABORT') {
            filter.status = 'ABORTED';
        } else if (query.result === 'WIN' || query.result === 'LOSS') {
            // For WIN/LOSS, we need status === FINISHED
            filter.status = 'FINISHED';
        }
    }

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