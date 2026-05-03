import { socketAuthMiddleware } from '../middleware/socketAuthMiddleware.js';
import { registerRoomSocketHandlers } from '../../modules/room/socket-handlers/room.socket-handler.js';

export const setupGameNamespace = (io) => {
    // Define the namespace exactly as required by the API contract
    const gameNamespace = io.of('/ws/game');

    // Enforce authentication on the entire namespace
    gameNamespace.use(socketAuthMiddleware);

    // Handle successful connections
    gameNamespace.on('connection', (socket) => {
        console.log(`[Socket] User ${socket.user.id} connected to /ws/game`);

        // Delegate business events to the Room module's Handler (Controller)
        registerRoomSocketHandlers(gameNamespace, socket);

        // Handle base disconnects (business logic for disconnects is inside registerRoomSocketHandlers)
        socket.on('disconnect', (reason) => {
            console.log(`[Socket] User ${socket.user.id} disconnected. Reason: ${reason}`);
        });
    });
};