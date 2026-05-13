/**
 * GameEmitter standardizes all Server -> Client WebSocket transmissions.
 * This ensures compliance with the strict API contract and Error policy.
 */
export const GameEmitter = {

    emitRoomCreated: (socket, payload) => {
        socket.emit('room:created', payload);
    },

    emitRoomUpdated: (io, roomId, payload) => {
        io.to(String(roomId)).emit('room:updated', payload);
    },

    emitRoomRemoved: (io, roomId) => {
        io.to(String(roomId)).emit('room:removed', { roomId: String(roomId) });
    },

    emitGameStart: (io, roomId, payload) => {
        io.to(String(roomId)).emit('game:start', payload);
    },

    emitPlayerDisconnected: (io, roomId, payload) => {
        io.to(String(roomId)).emit('player:disconnected', payload);
    },

    emitPlayerReconnected: (io, roomId, payload) => {
        io.to(String(roomId)).emit('player:reconnected', payload);
    },

    emitGameState: (io, roomId, payload) => {
        io.to(String(roomId)).emit('game:state', payload);
    },

    emitGameEnded: (io, roomId, payload) => {
        io.to(String(roomId)).emit('game:ended', payload);
    },

    emitChatMessage: (io, roomId, payload) => {
        io.to(String(roomId)).emit('chat:message', payload);
    },

    // --- Standardized Error Broadcaster ---
    emitError: (socket, eventName, errorObj) => {
        console.error(`[Socket Error - ${eventName}]`, errorObj);
        socket.emit('error', {
            event: eventName,
            error: errorObj.error || 'SERVER_ERROR',
            message: errorObj.message || 'An unexpected error occurred.',
            cause: errorObj.cause || null,
            valid_example: errorObj.valid_example || undefined
        });
    }
};