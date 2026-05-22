import { RoomService } from '../services/room.service.js';
import { GameEmitter } from '../../../sockets/emitters/game.emitter.js';

export const disconnectTimers = new Map();

/**
 * Registers room socket event handlers.
 * @param {Object} io - Socket.io instance.
 * @param {Object} socket - Socket instance.
 */
export const registerRoomSocketHandlers = (io, socket) => {
    const user = socket.user;

    socket.on('room:create', async (payload) => {
        try {
            const result = await RoomService.handleRoomCreate(user.id, payload);
            socket.join(result.room.id);
            GameEmitter.emitRoomCreated(socket, result);
            // Do not broadcast to the entire server. Arena uses manual refresh.
        } catch (err) {
            GameEmitter.emitError(socket, 'room:create', err);
        }
    });

    socket.on('room:join', async (payload) => {
        try {
            const result = await RoomService.handleRoomJoin(user.id, payload);
            const roomId = String(result.room.id);

            // Always rejoin the socket room channel first
            socket.join(roomId);

            if (result.action === 'rejoined') {
                // ── RECONNECT PATH ─────────────────────────────────────────────
                // 1. Clear the 60s grace-period abort timer for this user (if running)
                if (disconnectTimers.has(user.id)) {
                    clearTimeout(disconnectTimers.get(user.id));
                    disconnectTimers.delete(user.id);
                    
                }

                // 2. Tell the opponent the disconnected player has come back
                socket.to(roomId).emit('player:reconnected', { roomId });

                // 3. Send room:updated ONLY to the rejoining player's socket first.
                //    This ensures the frontend sets roomData (status: PLAYING, participants, etc.)
                //    BEFORE the board state arrives. Without this, roomData stays null and
                //    GameOnline/index.jsx renders the pre-game lobby instead of the arena.
                socket.emit('room:updated', { room: result.room });

                // 4. Send the current board state ONLY to the rejoining player's socket
                //    (not to the whole room — the opponent's board is already correct)
                if (result.gameState) {
                    socket.emit('game:state', result.gameState);
                }
                // ── END RECONNECT PATH ─────────────────────────────────────────
            } else {
                // Normal new-join path — unchanged behavior
                GameEmitter.emitRoomUpdated(io, roomId, { room: result.room });
                if (result.gameState) {
                    GameEmitter.emitGameState(io, roomId, result.gameState);
                }
            }
        } catch (err) {
            GameEmitter.emitError(socket, 'room:join', err);
        }
    });

    socket.on('game:move', async (payload) => {
        try {
            const result = await RoomService.handleGameMove(user.id, payload);
            GameEmitter.emitGameState(io, result.roomId, result.gameState);
            if (result.gameEnded) {
                GameEmitter.emitGameEnded(io, result.roomId, result.gameEnded);
                // If a rematch is available, the service returned the updated room summary.
                if (result.rematchAvailable && result.room) {
                    GameEmitter.emitRoomUpdated(io, result.roomId, { room: result.room });
                    // Keep sockets in the room so players can ready up for rematch
                } else {
                    GameEmitter.emitRoomRemoved(io, result.roomId);
                    io.in(result.roomId).socketsLeave(result.roomId);
                }
            }
        } catch (err) {
            GameEmitter.emitError(socket, 'game:move', err);
        }
    });

    socket.on('room:leave', async (payload) => {
        try {
            const intent = payload?.intent;   // 'abort' | 'navigate_away'
            const roomId = payload?.roomId;

            // ── NAVIGATE-AWAY PATH ───────────────────────────────────────────────
            // When the React component unmounts (Back button, link click, etc.) the
            // socket is still alive, so the 'disconnect' handler never fires.
            // We manually replicate the grace-period logic here.
            if (intent === 'navigate_away') {
                const activeRoom = await RoomService.getActiveRoomSummaryByUserId(user.id);

                // Only intercept when a match is actually in progress.
                if (activeRoom && activeRoom.status === 'PLAYING') {
                    // Clear any pre-existing timer for this user (defensive).
                    if (disconnectTimers.has(user.id)) {
                        clearTimeout(disconnectTimers.get(user.id));
                        disconnectTimers.delete(user.id);
                    }

                    // Tell the opponent a grace period has started.
                    GameEmitter.emitPlayerDisconnected(io, activeRoom.id, {
                        roomId: activeRoom.id,
                        timeLeft: 60,
                    });

                    // Start the 60-second abort timer.
                    const timerId = setTimeout(async () => {
                        try {
                            const result = await RoomService.handleRoomLeave(
                                user.id,
                                { roomId: activeRoom.id, isTimeout: true },
                            );
                            if (result.action === 'ignored') return;
                            if (result.gameEnded) {
                                GameEmitter.emitGameEnded(io, result.roomId, result.gameEnded);
                            }
                            if (result.action === 'removed' || result.action === 'aborted') {
                                GameEmitter.emitRoomRemoved(io, result.roomId);
                                io.in(result.roomId).socketsLeave(result.roomId);
                            }
                        } catch (e) {
                            if (e.error !== 'ROOM_NOT_FOUND') {
                                console.error('[Grace timer] Timeout leave failed:', e);
                            }
                        }
                        disconnectTimers.delete(user.id);
                    }, 60_000);

                    disconnectTimers.set(user.id, timerId);

                    // The socket itself stays connected; the player left the React
                    // component but may return via the Lobby's "REJOIN" button.
                    socket.leave(activeRoom.id);
                    return; // Do NOT fall through to the instant-abort path.
                }

                // Room is in WAITING / READY — fall through to normal leave logic.
            }
            // ── END NAVIGATE-AWAY PATH ───────────────────────────────────────────

            // ── NORMAL / ABORT PATH ──────────────────────────────────────────────
            // intent === 'abort', or any non-PLAYING room leave.
            const result = await RoomService.handleRoomLeave(user.id, { roomId });

            if (result.action === 'ignored') return;

            if (result.action === 'removed' || result.action === 'aborted') {
                if (result.gameEnded) GameEmitter.emitGameEnded(io, result.roomId, result.gameEnded);
                GameEmitter.emitRoomRemoved(io, result.roomId);
                io.in(result.roomId).socketsLeave(result.roomId);
            } else {
                socket.leave(result.roomId);
                GameEmitter.emitRoomUpdated(io, result.roomId, { room: result.room });
            }
            // ── END NORMAL / ABORT PATH ──────────────────────────────────────────
        } catch (err) {
            if (err?.error === 'ROOM_NOT_FOUND') {
                return;
            }

            GameEmitter.emitError(socket, 'room:leave', err);
        }
    });

    socket.on('chat:send', async (payload) => {
        try {
            const result = await RoomService.handleChatSend(user.id, payload);
            GameEmitter.emitChatMessage(io, result.roomId, result);
        } catch (err) {
            GameEmitter.emitError(socket, 'chat:send', err);
        }
    });

    socket.on('room:update_settings', async (payload) => {
        try {
            const result = await RoomService.handleUpdateSettings(user.id, payload);
            GameEmitter.emitRoomUpdated(io, result.roomId, { room: result.room });
        } catch (err) {
            GameEmitter.emitError(socket, 'room:update_settings', err);
        }
    });

    socket.on('room:set_first_turn', async (payload) => {
        try {
            const result = await RoomService.handleSetFirstTurn(user.id, payload);
            GameEmitter.emitRoomUpdated(io, result.roomId, { room: result.room });
        } catch (err) {
            GameEmitter.emitError(socket, 'room:set_first_turn', err);
        }
    });

    socket.on('room:ready', async (payload) => {
        try {
            const result = await RoomService.handleRoomReady(user.id, payload);
            GameEmitter.emitRoomUpdated(io, result.roomId, { room: result.room });
            if (result.gameStart) {
                GameEmitter.emitGameStart(io, result.roomId, { roomId: result.roomId, startedAt: result.room.startedAt });
            }
        } catch (err) {
            GameEmitter.emitError(socket, 'room:ready', err);
        }
    });

    socket.on('disconnect', async () => {
        try {
            const userSockets = await io.in(user.id.toString()).allSockets();
            if (userSockets.size > 0) return;

            const activeRoom = await RoomService.getActiveRoomSummaryByUserId(user.id);
            if (!activeRoom) return;

            if (activeRoom.status === 'PLAYING') {
                // In-game -> apply a 60s grace period
                GameEmitter.emitPlayerDisconnected(io, activeRoom.id, { roomId: activeRoom.id, timeLeft: 60 });

                const timerId = setTimeout(async () => {
                    try {
                        const result = await RoomService.handleRoomLeave(user.id, { roomId: activeRoom.id, isTimeout: true });
                        if (result.gameEnded) GameEmitter.emitGameEnded(io, result.roomId, result.gameEnded);

                        if (result.action === 'removed' || result.action === 'aborted') {
                            // Notify and evict remaining players from the room namespace
                            GameEmitter.emitRoomRemoved(io, result.roomId);
                            io.in(result.roomId).socketsLeave(result.roomId);
                        }
                    } catch (e) {
                        if (e.error !== 'ROOM_NOT_FOUND') {
                            console.error('Timeout leave failed', e);
                        }
                    }
                    disconnectTimers.delete(user.id);
                }, 60000);

                disconnectTimers.set(user.id, timerId);
            } else {
                // In lobby -> remove immediately, no grace period
                const result = await RoomService.handleRoomLeave(user.id, { roomId: activeRoom.id });
                if (result.action === 'removed') {
                    GameEmitter.emitRoomRemoved(io, result.roomId);
                } else if (result.action === 'updated') {
                    GameEmitter.emitRoomUpdated(io, result.roomId, { room: result.room });
                }
            }
        } catch (err) {
            if (err?.error === 'ROOM_NOT_FOUND') {
                return;
            }

            console.error('[Socket Disconnect Error]', err);
        }
    });
};