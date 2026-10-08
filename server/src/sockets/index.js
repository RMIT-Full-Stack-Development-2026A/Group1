import { Server } from 'socket.io';
import { setupGameNamespace } from './namespaces/game.namespace.js';

/**
 * Initializes Socket.io server.
 * @param {Object} httpServer - HTTP server instance.
 * @returns {Object} Socket.io instance.
 */
export const initSocketServer = (httpServer) => {
    const io = new Server(httpServer, {
        cors: {
            origin: ["http://localhost:8000", process.env.CLIENT_URL], 
            methods: ['GET', 'POST'],
            credentials: true 
        }
    });

    setupGameNamespace(io);

    return io;
};
