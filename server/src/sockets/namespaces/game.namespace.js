import { socketAuthMiddleware } from '../middleware/socketAuthMiddleware.js';
import { registerRoomSocketHandlers, disconnectTimers } from '../../modules/room/socket-handlers/room.socket_handlers.js';
import { RoomService } from '../../modules/room/services/room.service.js';
import { eventBus } from '../../utils/eventBus.util.js';
import { RoomInterface } from '../../modules/room/interfaces/room.interface.js'; 
import { GameEmitter } from '../emitters/game.emitter.js'; 
import { SYSTEM_EVENTS } from '../../utils/constants/event.containts.js';

/**
 * Configures game namespace.
 * @param {Object} io - Socket.io instance.
 */
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

            
        } catch (err) {
            console.error(`[EventBus] Error kicking players from closed room ${roomId}:`, err);
        }
    });

    eventBus.subscribe(SYSTEM_EVENTS.DUPLICATE_LOGIN, async ({ userId }) => {
        const stringPlayerId = userId.toString();

        try {
            // Take all sockets is connecting to this account
            const existingSockets = await gameNamespace.in(stringPlayerId).fetchSockets();

            // If there are old sockets, kick them out
            existingSockets.forEach(socket => {
                socket.emit('auth:force_logout', {
                    reason: "Your account was logged in from another location."
                });
                
                socket.disconnect(true);
            });

            if (existingSockets.length > 0) {
                
            }
        } catch (err) {
            console.error(`[EventBus] Error kicking duplicate user ${stringPlayerId}:`, err);
        }
    });
    
    gameNamespace.on('connection', async (socket) => {
        

        socket.join(socket.user.id.toString());
        
        // Handle user reconnect after refresh 
        try {
            const activeRoom = await RoomService.getActiveRoomSummaryByUserId(socket.user.id);
            if (activeRoom) {
                // Rejoin the correct chat/game channel
                socket.join(String(activeRoom.id));
            }
        } catch (error) {
            console.error('[Rehydration Error]', error);
        }

        registerRoomSocketHandlers(gameNamespace, socket);
    });
};