import mongoose from 'mongoose';

export const validateGameCreation = (payload) => {
    const errors = [];

    if (!payload || typeof payload !== 'object') {
        errors.push("Request body is missing or invalid.");
        return errors;
    }

    // This enpoint not support ONLINE_MATCH 
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

// Get games query validation
export const validateGameQuery = (query) => {
    const errors = [];
    // place to implement search/filter validation here
    return errors;
};

export const validateObjectId = (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return ["Invalid ID format."];
    }
    return [];
};