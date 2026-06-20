import mongoose from 'mongoose';

/**
 * Validates a MongoDB ObjectId.
 * @param {string} id - Identifier to validate.
 * @returns {boolean} True if valid.
 */
export const validateObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * Validates the payload for local game creation.
 * @param {Object} payload - Game session payload.
 * @returns {Array} List of validation errors.
 */
export const validateGameCreation = (payload) => {
    const errors = [];
    const allowedMarkerStyles = ['CLASSIC', 'GLOW', 'SKETCH', 'STONE', 'PIXEL', 'MINIMAL'];

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
    } else {
        payload.participants.forEach((participant, index) => {
            if (!participant || typeof participant !== 'object') {
                errors.push({
                    field: `participants[${index}]`,
                    error: 'INVALID_PARTICIPANT',
                    cause: 'Each participant must be a valid object.'
                });
                return;
            }

            if (typeof participant.markerStyle !== 'string' || !allowedMarkerStyles.includes(participant.markerStyle)) {
                errors.push({
                    field: `participants[${index}].markerStyle`,
                    error: 'INVALID_MARKER_STYLE',
                    cause: `Must be one of: ${allowedMarkerStyles.join(', ')}.`
                });
            }
        });
    }

    if (payload.firstTurnParticipantIndex !== 0 && payload.firstTurnParticipantIndex !== 1) {
        errors.push({ field: "firstTurnParticipantIndex", error: "INVALID_FIRST_TURN", cause: "Must be either 0 or 1." });
    }

    if (payload.moves && !Array.isArray(payload.moves)) {
        errors.push({ field: "moves", error: "INVALID_MOVES", cause: "Must be a valid array." });
    }

    return errors;
};

/**
 * Validates and sanitizes game query parameters.
 * @param {string} userId - Requesting user ID.
 * @param {Object} query - Request query string.
 * @returns {Object} Structured filter, sort, and pagination.
 */
export const validateGameQuery = (query = {}, userId = null) => {
    const page = Math.max(1, parseInt(query.page) || 1);
    const maxLimit = userId === null ? 300 : 100; 
    const limit = Math.max(1, Math.min(maxLimit, parseInt(query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter = {}; 

    // Filter if a specific userId is provided
    if (userId) {
        filter['participants.userId'] = userId;
    }

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
        const orConditions = [
            { sessionNumber: { $regex: query.q, $options: 'i' } },
            { 'participants.usernameSnapshot': { $regex: query.q, $options: 'i' } }
        ];

        // Also allow searching by MongoDB _id (displayed in the match history table)
        // Supports both full and partial hex IDs (e.g., "6a34d67")
        const q = String(query.q);
         if (validateObjectId(q)) {
             orConditions.push({ _id: new mongoose.Types.ObjectId(q) });
         } else if (/^[0-9a-fA-F]+$/.test(q)) {
            orConditions.push({
                $expr: {
                    $regexMatch: {
                        input: { $toString: "$_id" },
                        regex: q,
                        options: "i"
                    }
                }
            });
        }

        filter.$or = orConditions;
    }

    if (query.from || query.to) {
        filter.endedAt = {};
        if (query.from) filter.endedAt.$gte = new Date(query.from);
        if (query.to) filter.endedAt.$lte = new Date(query.to);
    }

    return { filter, sort: { endedAt: -1 }, pagination: { page, limit, skip } };
};