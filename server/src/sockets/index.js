import { Server } from 'socket.io';
import { setupGameNamespace } from './namespaces/game.namespace.js';

let io;

/**
 * Initializes Socket.io server.
 * @param {Object} httpServer - HTTP server instance.
 * @returns {Object} Socket.io instance.
 */
export const initSocketServer = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: ["http://localhost:8000", process.env.CLIENT_URL], 
            methods: ['GET', 'POST'],
            credentials: true 
        }
    });

    setupGameNamespace(io);

    
    return io;
};

/**
 * Retrieves global Socket.io instance.
 * @returns {Object} Socket.io instance.
 */
export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io has not been initialized!");
    }
    return io;
};