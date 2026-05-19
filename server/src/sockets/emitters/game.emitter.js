export const GameEmitter = {
    /** Emits room creation event. */
    emitRoomCreated: (socket, payload) => {
        socket.emit('room:created', payload);
    },

    /** Emits room update event. */
    emitRoomUpdated: (io, roomId, payload) => {
        io.to(String(roomId)).emit('room:updated', payload);
    },

    /** Emits room removal event. */
    emitRoomRemoved: (io, roomId) => {
        io.to(String(roomId)).emit('room:removed', { roomId: String(roomId) });
    },

    /** Emits game start event. */
    emitGameStart: (io, roomId, payload) => {
        io.to(String(roomId)).emit('game:start', payload);
    },

    /** Emits player disconnect event. */
    emitPlayerDisconnected: (io, roomId, payload) => {
        io.to(String(roomId)).emit('player:disconnected', payload);
    },

    /** Emits player reconnect event. */
    emitPlayerReconnected: (io, roomId, payload) => {
        io.to(String(roomId)).emit('player:reconnected', payload);
    },

    /** Emits game state payload. */
    emitGameState: (io, roomId, payload) => {
        io.to(String(roomId)).emit('game:state', payload);
    },

    /** Emits game move payload. */
    emitGameMoved: (io, roomId, payload) => {
        io.to(String(roomId)).emit('game:moved', payload);
    },

    /** Emits game end payload. */
    emitGameEnded: (io, roomId, payload) => {
        io.to(String(roomId)).emit('game:ended', payload);
    },

    /** Emits chat message event. */
    emitChatMessage: (io, roomId, payload) => {
        io.to(String(roomId)).emit('chat:message', payload);
    },

    /** Emits error event. */
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