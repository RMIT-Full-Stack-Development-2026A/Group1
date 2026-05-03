import { Server } from 'socket.io';
import { setupGameNamespace } from './namespaces/game.namespace.js';

export const initSocketServer = (httpServer) => {
    // Initialize Socket.io attached to the Express HTTP Server
    const io = new Server(httpServer, {
        cors: {
            origin: process.env.CLIENT_URL, // Must match your frontend URL
            methods: ['GET', 'POST'],
            credentials: true // Allows the browser to send the httpOnly access_token cookie
        }
    });

    // Boot up the /ws/game namespace
    setupGameNamespace(io);

    return io;
};