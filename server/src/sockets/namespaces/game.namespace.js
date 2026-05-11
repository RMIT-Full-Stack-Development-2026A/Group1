import { socketAuthMiddleware } from '../middleware/socketAuthMiddleware.js';
import { registerRoomSocketHandlers, disconnectTimers } from '../../modules/room/socket-handlers/room.socket_handlers.js';
import { RoomService } from '../../modules/room/services/room.service.js';
import { eventBus } from '../../utils/eventBus.util.js';
import { RoomInterface } from '../../modules/room/interfaces/room.interface.js'; 

export const setupGameNamespace = (io) => {
    const gameNamespace = io.of('/ws/game');
    gameNamespace.use(socketAuthMiddleware);

    eventBus.subscribe('admin:user_deactivated', async ({ userId, reason }) => {
        const stringPlayerId = userId.toString();
        
        const activeRoom = await RoomInterface.getActiveRoomSummaryByUserId(userId);
        if (activeRoom) {
            await RoomInterface.forceCloseRoomByAdmin(activeRoom.id);
            gameNamespace.emit('room:removed', { roomId: activeRoom.id });
            gameNamespace.in(activeRoom.id.toString()).socketsLeave(activeRoom.id.toString());
        }

        gameNamespace.to(stringPlayerId).emit('account:deactivated', {
            message: "Your account had been recently deactivated by Admin.",
            reason: reason
        });

        setTimeout(() => {
            gameNamespace.in(stringPlayerId).disconnectSockets(true);
        }, 100);

        console.log(`[Socket] Force disconnected banned user: ${stringPlayerId}`);
    });
    
    gameNamespace.on('connection', async (socket) => {
        console.log(`[Socket] User ${socket.user.id} connected to /ws/game`);

        socket.join(socket.user.id.toString());
        
        // REHYDRATION FEATURE (HANDLE USER RECONNECT AFTER REFRESH)
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

                    // Get the current moves array (board state) and send it to the frontend to redraw
                    const gameState = await RoomService.getGameState(activeRoom.id);
                    socket.emit('game:state', gameState);
                }
            }
        } catch (error) {
            console.error('[Rehydration Error]', error);
        }
        // END REHYDRATION

        registerRoomSocketHandlers(gameNamespace, socket);
    });
};