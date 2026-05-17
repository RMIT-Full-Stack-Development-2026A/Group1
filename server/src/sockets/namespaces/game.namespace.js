import { socketAuthMiddleware } from '../middleware/socketAuthMiddleware.js';
import { registerRoomSocketHandlers, disconnectTimers } from '../../modules/room/socket-handlers/room.socket_handlers.js';
import { RoomService } from '../../modules/room/services/room.service.js';
import { eventBus } from '../../utils/eventBus.util.js';
import { RoomInterface } from '../../modules/room/interfaces/room.interface.js'; 
import { GameEmitter } from '../emitters/game.emitter.js'; 
import { SYSTEM_EVENTS } from '../../utils/constants/event.containts.js';

export const setupGameNamespace = (io) => {
    const gameNamespace = io.of('/ws/game');
    gameNamespace.use(socketAuthMiddleware);

    // Handle admin deactivate user
    eventBus.subscribe(SYSTEM_EVENTS.USER_DEACTIVATED, async ({ userId, reason }) => {
        const stringPlayerId = userId.toString();
        
        try {
            // Find the active playing room
            const activeRoom = await RoomInterface.getActiveRoomSummaryByUserId(userId);
            if (activeRoom) {
                await RoomInterface.forceCloseRoomByAdmin(activeRoom.id);
                // Notify the forced closure
                GameEmitter.emitRoomRemoved(gameNamespace, activeRoom.id);
                gameNamespace.in(activeRoom.id.toString()).socketsLeave(activeRoom.id.toString());
            }

            // Send account deactivated event to the client
            gameNamespace.to(stringPlayerId).emit('account:deactivated', {
                message: "Your account has been deactivated by an administrator.",
                reason: reason
            });

            // Disconnect the socket gracefully
            setTimeout(() => {
                gameNamespace.in(stringPlayerId).disconnectSockets(true);
            }, 100);

            console.log(`[Socket] Force disconnected banned user: ${stringPlayerId}`);
        } catch (err) {
            console.error(`[EventBus] Error kicking deactivated user ${stringPlayerId}:`, err);
        }
    });

    // Handle Admin force close
    eventBus.subscribe(SYSTEM_EVENTS.ROOM_FORCE_CLOSED, async ({ roomId, endedAt }) => {
        try {
            // Notify to the players
            gameNamespace.to(roomId).emit('game:ended', {
                roomId,
                winnerParticipantIndex: null,
                winningLine: [],
                result: 'ADMIN_FORCE_CLOSE',
                endedAt
            });

            // Remove this room 
            gameNamespace.emit('room:removed', { roomId });

            // Force all players out 
            gameNamespace.in(roomId).socketsLeave(roomId);

            console.log(`[Socket] Room ${roomId} was force closed by Admin.`);
        } catch (err) {
            console.error(`[EventBus] Error kicking players from closed room ${roomId}:`, err);
        }
    });
    
    gameNamespace.on('connection', async (socket) => {
        console.log(`[Socket] User ${socket.user.id} connected to /ws/game`);

        socket.join(socket.user.id.toString());
        
        // Habdle user reconnect after refresh 
        try {
            const activeRoom = await RoomService.getActiveRoomSummaryByUserId(socket.user.id);
            if (activeRoom) {
                // Rejoin the correct chat/game channel
                socket.join(String(activeRoom.id));
                
                if (activeRoom.status === 'PLAYING') {
                    // Clear the 60s disconnect countdown timer
                    if (disconnectTimers.has(socket.user.id)) {
                        clearTimeout(disconnectTimers.get(socket.user.id));
                        disconnectTimers.delete(socket.user.id);
                    }

                    // Notify the opponent that this player has reconnected
                    socket.to(String(activeRoom.id)).emit('player:reconnected', { roomId: activeRoom.id });

                    // Sync the latest board state to both players
                    const gameState = await RoomService.getGameState(activeRoom.id);
                    if (gameState) {
                        GameEmitter.emitGameState(gameNamespace, activeRoom.id, gameState);
                    }
                }
            }
        } catch (error) {
            console.error('[Rehydration Error]', error);
        }

        registerRoomSocketHandlers(gameNamespace, socket);
    });
};