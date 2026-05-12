import { Server } from 'socket.io';
import { setupGameNamespace } from './namespaces/game.namespace.js';

export const initSocketServer = (httpServer) => {
    // Initialize Socket.io attached to the raw HTTP Server
    const io = new Server(httpServer, {
        cors: {
            origin: ["http://localhost:8000", process.env.CLIENT_URL], 
            methods: ['GET', 'POST'],
            credentials: true 
        }
    });

    // Boot up the /ws/game namespace
    setupGameNamespace(io);

    console.log("[Socket] Socket.io server initialized and namespaces wired.");
    return io;
};

// Broadcast globally from outside a namespace context
export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io has not been initialized!");
    }
    return io;
};