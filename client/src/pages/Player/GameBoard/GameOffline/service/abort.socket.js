/**
 * abort.socket.js — Placeholder for online abort consent flow.
 * When WebSocket (socket.io) is implemented, wire these up to the game namespace.
 *
 * Flow:
 *  1. Player A clicks ABORT → emits 'game:abort_request' to opponent
 *  2. Opponent receives 'game:abort_request' → shows consent modal
 *  3. Opponent emits 'game:abort_consent' (agree) or 'game:abort_reject' (reject)
 *  4. Server broadcasts result → both clients handle
 */

export const emitAbortRequest = (socket, roomId) => {
    // TODO: socket.emit('game:abort_request', { roomId });
    console.warn('[ABORT SOCKET] Placeholder — emit abort_request to room:', roomId);
};

export const emitAbortConsent = (socket, roomId, agreed) => {
    // TODO: socket.emit('game:abort_consent', { roomId, agreed });
    console.warn('[ABORT SOCKET] Placeholder — emit abort_consent:', agreed);
};

export const onAbortRequest = (socket, callback) => {
    // TODO: socket.on('game:abort_request', callback);
    console.warn('[ABORT SOCKET] Placeholder — listening for abort_request');
};

export const onAbortResolved = (socket, callback) => {
    // TODO: socket.on('game:abort_resolved', callback);
    console.warn('[ABORT SOCKET] Placeholder — listening for abort_resolved');
};