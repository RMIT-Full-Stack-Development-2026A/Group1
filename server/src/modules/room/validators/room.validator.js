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
        }  else if (ALL_ROOM_STATUSES.includes(upperStatus)) {
             if (isAdmin) {
                 // ONLY Admins can query terminal statuses (CLOSED, ABORTED)
                 filter.status = upperStatus;
             } else {
                 throw {
                     statusCode: 403,
                     error: "FORBIDDEN_STATUS_QUERY",
                     message: "You do not have permission to query closed or aborted rooms.",
                     valid_example: `Allowed statuses: 'ACTIVE' or ${ACTIVE_ROOM_STATUSES.join(', ')}`
                 };
             }
        } else {
            throw {
                statusCode: 400,
                 error: "INVALID_QUERY",
                 message: "Invalid status parameter.",
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

export const validateRoomCreate = (payload) => {
    const boardSize = parseInt(payload?.boardSize);
    const marker = typeof payload?.marker === 'string' ? payload.marker.trim().toUpperCase() : '';
    
    // Check type before trim() & toUpperCase()
    // markerStyle is applied to the host participant.
    const boardStyle = typeof payload?.boardStyle === 'string' ? payload.boardStyle.trim().toUpperCase() : 'CLASSIC';
    const markerStyle = typeof payload?.markerStyle === 'string' ? payload.markerStyle.trim().toUpperCase() : 'CLASSIC';

    if (![10, 15].includes(boardSize)) {
        throw { statusCode: 400, error: "INVALID_BOARD_SIZE", message: "Board size must be 10 or 15." };
    }
    if (!['X', 'O'].includes(marker)) {
        throw { statusCode: 400, error: "INVALID_MARKER", message: "Marker must be 'X' or 'O'." };
    }

    const allowedBoardStyles = ['CLASSIC', 'DARK', 'NEON'];
    if (!allowedBoardStyles.includes(boardStyle)) {
        throw { statusCode: 400, error: "INVALID_BOARD_STYLE", message: `Board style must be one of: ${allowedBoardStyles.join(', ')}` };
    }

    const allowedMarkerStyles = ['CLASSIC', 'GLOW', 'SKETCH', 'STONE', 'PIXEL', 'MINIMAL'];
    if (!allowedMarkerStyles.includes(markerStyle)) {
        throw { statusCode: 400, error: "INVALID_MARKER_STYLE", message: `Marker style must be one of: ${allowedMarkerStyles.join(', ')}` };
    }

    return { boardSize, marker, boardStyle, markerStyle };
};

export const validateRoomJoin = (payload) => {
    if (!payload?.roomId || !mongoose.Types.ObjectId.isValid(payload.roomId)) {
        throw { statusCode: 400, error: "INVALID_ROOM_ID", message: "Valid Room ID is required." };
    }
    if (payload?.markerStyle) {
        const allowedMarkerStyles = ['CLASSIC', 'GLOW', 'SKETCH', 'STONE', 'PIXEL', 'MINIMAL'];
        const markerStyle = String(payload.markerStyle).trim().toUpperCase();
        if (!allowedMarkerStyles.includes(markerStyle)) {
            throw { statusCode: 400, error: "INVALID_MARKER_STYLE", message: `Marker style must be one of: ${allowedMarkerStyles.join(', ')}` };
        }
        return { roomId: payload.roomId, markerStyle };
    }
    return { roomId: payload.roomId };
};

export const validateRoomLeave = (payload) => {
    const { roomId, isTimeout } = payload || {};
    
    // Check if roomId is valid ObjectId string
    if (!roomId || !mongoose.Types.ObjectId.isValid(roomId)) {
        throw { statusCode: 400, error: "INVALID_ROOM_ID", message: "Valid Room ID is required to leave." };
    }
    
    // Check isTimeout is boolean if provided 
    if (isTimeout !== undefined && typeof isTimeout !== 'boolean') {
        throw { statusCode: 400, error: "INVALID_TIMEOUT_FLAG", message: "isTimeout must be a boolean." };
    }
    
    // return both roomId and isTimeout 
    return { roomId, isTimeout: isTimeout ?? false };
};

export const validateGameMove = (payload) => {
    const { roomId, row, col } = payload || {};
    if (!roomId || !mongoose.Types.ObjectId.isValid(roomId)) {
        throw { statusCode: 400, error: "INVALID_ROOM_ID", message: "Valid Room ID is required." };
    }
    if (row === undefined || col === undefined || row < 0 || col < 0) {
        throw { statusCode: 400, error: "INVALID_COORDINATES", message: "Valid row and column indices are required." };
    }
    return { roomId, row: parseInt(row), col: parseInt(col) };
};

export const validateChatSend = (payload) => {
    const { roomId, message } = payload || {};
    if (!roomId || !mongoose.Types.ObjectId.isValid(roomId)) {
        throw { statusCode: 400, error: "INVALID_ROOM_ID", message: "Valid Room ID is required." };
    }
    if (!message || typeof message !== 'string' || message.trim().length === 0 || message.length > 500) {
        throw { statusCode: 400, error: "INVALID_MESSAGE", message: "Message must be a string between 1 and 500 characters." };
    }
    return { roomId, message: message.trim() };
};
export const validateRoomUpdateSettings = (payload) => {
    const { roomId } = payload || {};
    if (!roomId || !mongoose.Types.ObjectId.isValid(roomId)) {
        throw { statusCode: 400, error: "INVALID_ROOM_ID", message: "Valid Room ID is required." };
    }

    const boardStyle = typeof payload?.boardStyle === 'string' ? payload.boardStyle.trim().toUpperCase() : undefined;
    const markerStyle = typeof payload?.markerStyle === 'string' ? payload.markerStyle.trim().toUpperCase() : undefined;
    const marker = typeof payload?.marker === 'string' ? payload.marker.trim().toUpperCase() : undefined;

    const allowedBoardStyles = ['CLASSIC', 'DARK', 'NEON'];
    if (boardStyle !== undefined && !allowedBoardStyles.includes(boardStyle)) {
        throw { statusCode: 400, error: "INVALID_BOARD_STYLE", message: `Board style must be one of: ${allowedBoardStyles.join(', ')}` };
    }

    const allowedMarkerStyles = ['CLASSIC', 'GLOW', 'SKETCH', 'STONE', 'PIXEL', 'MINIMAL'];
    if (markerStyle !== undefined && !allowedMarkerStyles.includes(markerStyle)) {
        throw { statusCode: 400, error: "INVALID_MARKER_STYLE", message: `Marker style must be one of: ${allowedMarkerStyles.join(', ')}` };
    }

    if (marker !== undefined && !['X', 'O'].includes(marker)) {
        throw { statusCode: 400, error: "INVALID_MARKER", message: "Marker must be 'X' or 'O'." };
    }

    return { roomId, boardStyle, markerStyle, marker };
};

export const validateRoomSetFirstTurn = (payload) => {
    const { roomId, firstTurnParticipantIndex } = payload || {};
    if (!roomId || !mongoose.Types.ObjectId.isValid(roomId)) {
        throw { statusCode: 400, error: "INVALID_ROOM_ID", message: "Valid Room ID is required." };
    }
    if (![0, 1].includes(parseInt(firstTurnParticipantIndex))) {
        throw { statusCode: 400, error: "INVALID_TURN_INDEX", message: "firstTurnParticipantIndex must be 0 or 1." };
    }
    return { roomId, firstTurnParticipantIndex: parseInt(firstTurnParticipantIndex) };
};

export const validateRoomReady = (payload) => {
    if (!payload?.roomId || !mongoose.Types.ObjectId.isValid(payload.roomId)) {
        throw { statusCode: 400, error: "INVALID_ROOM_ID", message: "Valid Room ID is required." };
    }
    return { roomId: payload.roomId };
};