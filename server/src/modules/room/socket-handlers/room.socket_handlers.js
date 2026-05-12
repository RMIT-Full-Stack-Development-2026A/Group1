import { RoomService } from '../services/room.service.js';
import { GameEmitter } from '../../sockets/emitters/game.emitter.js';

export const disconnectTimers = new Map();

export const registerRoomSocketHandlers = (io, socket) => {
    const user = socket.user;

    socket.on('room:create', async (payload) => {
        try {
            const result = await RoomService.handleRoomCreate(user.id, payload);
            socket.join(result.room.id);
            GameEmitter.emitRoomCreated(socket, result);
            // KHÔNG broadcast toàn server để tránh bão. Arena dùng manual refresh.
        } catch (err) {
            GameEmitter.emitError(socket, 'room:create', err);
        }
    });

    socket.on('room:join', async (payload) => {
        try {
            const result = await RoomService.handleRoomJoin(user.id, payload);
            socket.join(result.room.id);
            GameEmitter.emitRoomUpdated(io, result.room.id, { room: result.room });
            if (result.gameState) {
                GameEmitter.emitGameState(io, result.room.id, result.gameState);
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
                GameEmitter.emitRoomRemoved(io, result.roomId);
                io.in(result.roomId).socketsLeave(result.roomId);
            }
        } catch (err) {
            GameEmitter.emitError(socket, 'game:move', err);
        }
    });

    socket.on('room:leave', async (payload) => {
        try {
            const result = await RoomService.handleRoomLeave(user.id, payload);
            if (result.action === 'removed' || result.action === 'aborted') {
                if (result.gameEnded) GameEmitter.emitGameEnded(io, result.roomId, result.gameEnded);
                GameEmitter.emitRoomRemoved(io, result.roomId);
                io.in(result.roomId).socketsLeave(result.roomId);
            } else {
                GameEmitter.emitRoomUpdated(io, result.roomId, { room: result.room });
                socket.leave(result.roomId);
            }
        } catch (err) {
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
            const activeRoom = await RoomService.getActiveRoomSummaryByUserId(user.id);
            if (!activeRoom) return;

            if (activeRoom.status === 'PLAYING') {
                // In-game -> apply a 60s grace period
                GameEmitter.emitPlayerDisconnected(io, activeRoom.id, { roomId: activeRoom.id, timeLeft: 60 });

                const timerId = setTimeout(async () => {
                    // If not reconnected after 60s -> treat as a loss
                    try {
                        const result = await RoomService.handleRoomLeave(user.id, { roomId: activeRoom.id, isTimeout: true });
                        GameEmitter.emitGameEnded(io, result.roomId, result.gameEnded);
                        GameEmitter.emitRoomRemoved(io, result.roomId);
                        io.in(result.roomId).socketsLeave(result.roomId);
                    } catch (e) {
                        console.error('Timeout leave failed', e);
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
            console.error('[Socket Disconnect Error]', err);
        }
    });
};