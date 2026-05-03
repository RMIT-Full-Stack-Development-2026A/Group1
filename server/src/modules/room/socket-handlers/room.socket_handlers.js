import { RoomService } from '../services/room.service.js';

export const registerRoomSocketHandlers = (io, socket) => {
    // We assume socket.user is populated by a socketAuthMiddleware
    const user = socket.user;

    // Helper to format and send errors
    const handleError = (err, eventName) => {
        console.error(`[Socket Error] ${eventName}:`, err.message || err);
        socket.emit('error', {
            event: eventName,
            error: err.error || 'SERVER_ERROR',
            message: err.message || 'An unexpected error occurred.',
            cause: err.cause || null
        });
    };

    socket.on('room:create', async (payload) => {
        try {
            const result = await RoomService.handleRoomCreate(user.id, payload);
            
            // Join the socket to the new room's specific channel
            socket.join(result.room.id);
            
            // Send success to creator
            socket.emit('room:created', result);
            // Broadcast to all users in the arena
            io.emit('room:updated', result);
        } catch (err) {
            handleError(err, 'room:create');
        }
    });

    socket.on('room:join', async (payload) => {
        try {
            const result = await RoomService.handleRoomJoin(user.id, payload);
            
            socket.join(result.room.id);
            
            // Broadcast updated room state to arena and room members
            io.emit('room:updated', { room: result.room });

            // If the room transitioned to PLAYING, broadcast initial game state
            if (result.gameState) {
                io.to(result.room.id).emit('game:state', result.gameState);
            }
        } catch (err) {
            handleError(err, 'room:join');
        }
    });

    socket.on('game:move', async (payload) => {
        try {
            const result = await RoomService.handleGameMove(user.id, payload);
            
            // Broadcast the new game state to everyone in the room
            io.to(result.roomId).emit('game:state', result.gameState);

            // If the move ended the game (WIN/DRAW), broadcast game:ended and clean up
            if (result.gameEnded) {
                io.to(result.roomId).emit('game:ended', result.gameEnded);
                io.emit('room:removed', { roomId: result.roomId });
                io.in(result.roomId).socketsLeave(result.roomId);
            }
        } catch (err) {
            handleError(err, 'game:move');
        }
    });

    socket.on('room:leave', async (payload) => {
        try {
            const result = await RoomService.handleRoomLeave(user.id, payload);
            
            socket.leave(payload.roomId);

            if (result.action === 'removed') {
                io.emit('room:removed', { roomId: result.roomId });
            } else if (result.action === 'updated') {
                io.emit('room:updated', { room: result.room });
            } else if (result.action === 'aborted') {
                io.to(result.roomId).emit('game:ended', result.gameEnded);
                io.emit('room:removed', { roomId: result.roomId });
                io.in(result.roomId).socketsLeave(result.roomId);
            }
        } catch (err) {
            handleError(err, 'room:leave');
        }
    });

    socket.on('chat:send', async (payload) => {
        try {
            const result = await RoomService.handleChatSend(user.id, payload);
            io.to(result.roomId).emit('chat:message', result);
        } catch (err) {
            handleError(err, 'chat:send');
        }
    });

    socket.on('disconnect', async () => {
        // Automatically handle disconnects as leaving the active room
        try {
            const activeRoom = await RoomService.getActiveRoomSummaryByUserId(user.id);
            if (activeRoom) {
                const result = await RoomService.handleRoomLeave(user.id, { roomId: activeRoom.id });
                if (result.action === 'removed') {
                    io.emit('room:removed', { roomId: result.roomId });
                } else if (result.action === 'aborted') {
                    io.to(result.roomId).emit('game:ended', result.gameEnded);
                    io.emit('room:removed', { roomId: result.roomId });
                }
            }
        } catch (err) {
            console.error('[Socket Disconnect Error]', err);
        }
    });
};