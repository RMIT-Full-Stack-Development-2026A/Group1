import { RoomRepository } from '../repositories/room.repository.js';
import { RoomDTO } from '../dtos/room.dto.js';
import { GameInterface } from '../../game/interfaces/game.interface.js';
import { AuthInterface } from '../../auth/interfaces/auth.interface.js';
import { ROOM_STATUS } from '../constants/room.constants.js';
import { validateRoomQuery, validateObjectId, validateRoomCreate, validateRoomJoin, validateGameMove, validateChatSend, validateRoomUpdateSettings, validateRoomSetFirstTurn, validateRoomReady } from '../validators/room.validator.js';
import { GameRoom } from '../models/gameRoom.model.js'; 

export const RoomService = {
    getArenaRooms: async (query, requestingUser) => {
        const { filter, sort, pagination } = validateRoomQuery(query, requestingUser);
        
        const { rooms, total } = await RoomRepository.findPaginated(filter, sort, pagination.skip, pagination.limit);
        
        return RoomDTO.toRoomListResponse(rooms, { 
            total, 
            page: pagination.page, 
            limit: pagination.limit 
        });
    },

    getRoomDetail: async (roomId, requestingUser) => {
        if (!validateObjectId(roomId)) {
            throw {
                statusCode: 400,
                error: "INVALID_IDENTIFIER",
                message: "Invalid room ID.",
                cause: "The requested ID is not a valid MongoDB ObjectId.",
                valid_example: "Use a valid 24-character hex string."
            };
        }

        const room = await RoomRepository.findById(roomId);
        
        if (!room) {
            throw {
                statusCode: 404,
                error: "ROOM_NOT_FOUND",
                message: "Room not found.",
                cause: `No room record exists matching the ID: ${roomId}.`,
                valid_example: "Ensure the room ID is correct and the room hasn't been closed/removed."
            };
        }

        // Authorization check
        const isParticipant = room.participants && room.participants.some(
            (participant) => participant?.userId?.toString() === requestingUser.id.toString()
        );
        const isAdmin = requestingUser.role === 'ADMIN';

        if (!isParticipant && !isAdmin) {
            throw {
                statusCode: 403,
                error: "FORBIDDEN_ACCESS",
                message: "Access denied to room state.",
                cause: "The requester is neither a participant in the room nor an administrator.",
                valid_example: "Ensure you are logged into an account that is actively part of this room."
            };
        }

        return RoomDTO.toRoomDetail(room);
    },

    getActiveRoomSummaryByUserId: async (userId) => {
        const room = await RoomRepository.findActiveRoomByUserId(userId);
        if (!room) return null;
        return RoomDTO.toActiveRoomSummary(room);
    },

    getActiveRoomsCount: async () => {
        return RoomRepository.countActiveRooms();
    },


    getPaginatedRooms: async (filter, sort, skip, limit) => {
        const { rooms, total } = await RoomRepository.findPaginated(filter, sort, skip, limit);
        const page = limit > 0 ? Math.floor(skip / limit) + 1 : 1;
        return RoomDTO.toRoomListResponse(rooms, {
            total,
            page,
            limit
        });
    },

    forceCloseRoomByAdmin: async (roomId) => {
        const room = await RoomRepository.findById(roomId);

        // Room doesn't exist
        if (!room) {
            throw {
                statusCode: 404,
                error: "ROOM_NOT_FOUND",
                message: "Room not found.",
                cause: `No room record exists matching the ID: ${roomId}.`
            };
        }

        // Room closed
        if (!room || ['CLOSED', 'ABORTED'].includes(room.status)) {
            throw {
                statusCode: 409, // 409 Conflict is appropriate here
                error: "ROOM_ALREADY_CLOSED",
                message: "Room is already closed or aborted.",
                cause: `The room ID ${roomId} is currently in a ${room.status} state.`
            };
        }

        // Create a single timestamp 
        const closedAt = new Date();

        // Update Room State to CLOSED by ADMIN
        const closedRoom = await RoomRepository.updateRoomStatus(roomId, {
            status: 'CLOSED',
            closedBy: 'ADMIN',
            endedAt: closedAt
        });

        // Abort if the update failed
        if (!closedRoom) {
            throw {
                statusCode: 500,
                error: "UPDATE_FAILED",
                message: "Failed to force close the room.",
                cause: "The room status update failed unexpectedly due to a concurrent database modification.",
                valid_example: "Please try the request again."
            }; 
        }

        // If the match was currently PLAYING
        if (room.status === 'PLAYING') {
            const firstTurnParticipantIndex = room.moves?.length
                ? (room.moves[0]?.byParticipantIndex ?? 0)
                : (room.currentTurnParticipantIndex || 0);

            await GameInterface.createOnlineGameSessionFromRoom({
                sourceRoomId: room._id,
                gameType: 'ONLINE_MATCH',
                boardSize: room.boardSize,
                participants: room.participants,
                firstTurnParticipantIndex,
                status: 'ABORTED',
                endedReason: 'ADMIN_FORCE_CLOSE', // Explicitly marked as admin intervention
                moves: room.moves,
                totalMoves: room.moveCount,
                startedAt: room.startedAt,
                endedAt: closedAt
            });
        }
        
        return true;
    },

    // --- WEBSOCKET METHODS ---

    handleRoomCreate: async (userId, payload) => {
        const { boardSize, marker, boardStyle, markerStyle } = validateRoomCreate(payload);

        // Ensure user doesn't already have an active room
        const existingRoom = await RoomRepository.findActiveRoomByUserId(userId);
        if (existingRoom) {
            throw { statusCode: 400, error: "ALREADY_IN_ROOM", message: "You are already in an active room." };
        }

        const user = await AuthInterface.getUserById(userId);
        
        const newRoomData = {
            boardSize,
            boardStyle,
            markerStyle,
            firstTurnParticipantIndex: 0,
            status: ROOM_STATUS.WAITING,
            participants: [{
                userId: user._id,
                usernameSnapshot: user.username,
                mark: marker,
                joinedAt: new Date(),
                isHost: true,
                isReady: false
            }]
        };

        const room = await RoomRepository.createRoom(newRoomData);
        return RoomDTO.toSocketRoomCreated(room);
    },

    handleRoomJoin: async (userId, payload) => {
        const { roomId } = validateRoomJoin(payload);

        const room = await RoomRepository.findById(roomId);
        if (!room) throw { statusCode: 404, error: "ROOM_NOT_FOUND", message: "Room not found." };
        if (room.status !== ROOM_STATUS.WAITING) throw { statusCode: 400, error: "ROOM_NOT_WAITING", message: "Room is already full or playing." };
        
        // Check if user is already the host
        if (room.participants[0].userId.toString() === userId.toString()) {
            throw { statusCode: 400, error: "ALREADY_IN_ROOM", message: "You are already in this room." };
        }

        const user = await AuthInterface.getUserById(userId);
        const hostMark = room.participants[0].mark;
        const joinerMark = hostMark === 'X' ? 'O' : 'X';

        const updatedRoom = await RoomRepository.addParticipant(roomId, {
            userId: user._id,
            usernameSnapshot: user.username,
            mark: joinerMark,
            joinedAt: new Date(),
            isHost: false,
            isReady: false
        }, ROOM_STATUS.READY);

        if (!updatedRoom) {
            throw { statusCode: 409, error: "ROOM_FULL", message: "Room is no longer waiting or already full." };
        }

        const gameState = RoomDTO.toGameStatePayload({
            room: updatedRoom,
            board: updatedRoom.moves
        });

        return { room: RoomDTO.toRoomSummary(updatedRoom), gameState };
    },

    handleGameMove: async (userId, payload) => {
        const { roomId, row, col } = validateGameMove(payload);

        const room = await RoomRepository.findById(roomId);
        if (!room || room.status !== ROOM_STATUS.PLAYING) {
            throw { statusCode: 400, error: "INVALID_ROOM_STATE", message: "Room is not in a playing state." };
        }

        const pIndex = room.participants.findIndex(p => p.userId.toString() === userId.toString());
        if (pIndex === -1 || pIndex !== room.currentTurnParticipantIndex) {
            throw { statusCode: 403, error: "NOT_YOUR_TURN", message: "It is not your turn." };
        }

        // Validate coordinate uniqueness
        if (room.moves.some(m => m.row === row && m.col === col)) {
            throw { statusCode: 400, error: "INVALID_MOVE", message: "Cell is already occupied." };
        }

        // Convert Row/Col to Algebraic (e.g., Row 0, Col 0 -> A1)
        const coordinate = `${String.fromCharCode(65 + col)}${row + 1}`;
        const newMove = { moveNumber: room.moveCount + 1, byParticipantIndex: pIndex, row, col, coordinate, placedAt: new Date() };

        // Push move to DB
        const nextTurn = pIndex === 0 ? 1 : 0;
        let updatedRoom = await RoomRepository.pushMove(roomId, newMove, nextTurn);

        // TODO: Implement Gomoku 5-in-a-row algorithm to check for Win/Draw using `updatedRoom.moves`
        const isWin = false; // Mocked
        const isDraw = updatedRoom.moveCount >= (room.boardSize * room.boardSize); // Mocked

        let gameEnded = null;

        if (isWin || isDraw) {
            const endedAt = new Date();
            const status = ROOM_STATUS.CLOSED;
            updatedRoom = await RoomRepository.updateRoomStatus(roomId, { status, endedAt });

            // Persist to Game History
            await GameInterface.createOnlineGameSessionFromRoom({
                sessionNumber: `ONL-${room.roomNumber}`,
                sourceRoomId: room._id,
                gameType: 'ONLINE_MATCH',
                boardSize: room.boardSize,
                boardStyle: room.boardStyle,
                markerStyle: room.markerStyle,
                participants: room.participants,
                firstTurnParticipantIndex: room.firstTurnParticipantIndex ?? 0,
                status: isWin ? 'FINISHED' : 'DRAW',
                endedReason: isWin ? 'WIN' : 'DRAW',
                winnerParticipantIndex: isWin ? pIndex : null,
                winningLine: [], // Populate from algorithm
                moves: updatedRoom.moves,
                totalMoves: updatedRoom.moveCount,
                startedAt: room.startedAt,
                endedAt
            });

            gameEnded = RoomDTO.toGameEndedPayload({
                roomId,
                winnerParticipantIndex: isWin ? pIndex : null,
                winningLine: [],
                result: isWin ? 'WIN' : 'DRAW',
                endedAt
            });
        }

        return {
            roomId,
            gameState: RoomDTO.toGameStatePayload({ room: updatedRoom, board: updatedRoom.moves }),
            gameEnded
        };
    },

    handleRoomLeave: async (userId, payload) => {
        const { roomId, isTimeout } = payload; 
        const room = await GameRoom.findById(roomId);
        if (!room) throw { statusCode: 404, error: "ROOM_NOT_FOUND", message: "Room not found." };

        const isParticipant = room.participants.some(p => p.userId.toString() === userId.toString());
        if (!isParticipant && !isTimeout) return { action: 'ignored' };

        const endedAt = new Date();

        if (room.status === ROOM_STATUS.PLAYING) {
            // In play: mark as a loss due to timeout or voluntary leave
            room.status = ROOM_STATUS.ABORTED;
            room.endedAt = endedAt;
            await room.save();
            
            // Persist to game history
            await GameInterface.createOnlineGameSessionFromRoom({
                sessionNumber: `ONL-${room.roomNumber}`,
                sourceRoomId: room._id,
                gameType: 'ONLINE_MATCH',
                boardSize: room.boardSize,
                boardStyle: room.boardStyle,
                markerStyle: room.markerStyle,
                participants: room.participants,
                firstTurnParticipantIndex: room.firstTurnParticipantIndex ?? 0,
                status: 'ABORTED',
                endedReason: 'PLAYER_ABORT',
                abortedByUserId: userId,
                moves: room.moves,
                totalMoves: room.moveCount,
                startedAt: room.startedAt ?? room.createdAt ?? endedAt,
                endedAt
            });

            return {
                action: 'aborted',
                roomId,
                gameEnded: RoomDTO.toGameEndedPayload({
                    roomId, result: 'ABORTED', endedAt
                })
            };
        } 
        
        // If the room is in the lobby state (WAITING / READY)
        const remainingParticipants = room.participants.filter(p => p.userId.toString() !== userId.toString());
        
        if (remainingParticipants.length === 0) {
            // If both players leave, delete the room
            await RoomRepository.deleteRoom(roomId);
            return { action: 'removed', roomId };
        } else {
            // If one player remains, promote them to host, revert to WAITING, and clear ready state
            remainingParticipants[0].isHost = true;
            remainingParticipants[0].isReady = false;
            
            room.participants = remainingParticipants;
            room.status = ROOM_STATUS.WAITING;
            await room.save();
            
            return { action: 'updated', roomId, room: RoomDTO.toRoomSummary(room) };
        }
    },

    handleChatSend: async (userId, payload) => {
        const { roomId, message } = validateChatSend(payload);
        
        // Strict real-time DB check for premium
        const user = await AuthInterface.getUserById(userId);
        if (!user || !user.isPremium) {
            throw { statusCode: 403, error: "PREMIUM_REQUIRED", message: "In-game chat requires an active Premium subscription." };
        }

        return RoomDTO.toChatMessagePayload({
            roomId,
            sender: {
                userId: String(user._id),
                usernameSnapshot: user.username
            },
            message,
            timestamp: new Date()
        });
    },
    
    handleUpdateSettings: async (userId, payload) => {
        const { roomId, boardStyle, markerStyle } = validateRoomUpdateSettings(payload);
        const room = await GameRoom.findById(roomId);
        
        if (!room) throw { statusCode: 404, error: "ROOM_NOT_FOUND", message: "Room not found." };
        if (room.status === ROOM_STATUS.PLAYING) throw { statusCode: 400, error: "INVALID_STATE", message: "Cannot change settings while playing." };
        
        const isHost = room.participants.some(p => p.userId.toString() === userId.toString() && p.isHost);
        if (!isHost) throw { statusCode: 403, error: "FORBIDDEN", message: "Only the host can change settings." };

        room.boardStyle = boardStyle;
        room.markerStyle = markerStyle;
        room.participants.forEach(p => p.isReady = false); // Reset ready to prevent cheating
        
        await room.save();
        return { roomId, room: RoomDTO.toRoomSummary(room) };
    },

    handleSetFirstTurn: async (userId, payload) => {
        const { roomId, firstTurnParticipantIndex } = validateRoomSetFirstTurn(payload);
        const room = await GameRoom.findById(roomId);
        
        if (!room) throw { statusCode: 404, error: "ROOM_NOT_FOUND", message: "Room not found." };
        const isHost = room.participants.some(p => p.userId.toString() === userId.toString() && p.isHost);
        if (!isHost) throw { statusCode: 403, error: "FORBIDDEN", message: "Only the host can set first turn." };

        room.firstTurnParticipantIndex = firstTurnParticipantIndex;
        room.participants.forEach(p => p.isReady = false); // Reset ready
        
        await room.save();
        return { roomId, room: RoomDTO.toRoomSummary(room) };
    },

    handleRoomReady: async (userId, payload) => {
        const { roomId } = validateRoomReady(payload);
        const room = await GameRoom.findById(roomId);
        
        if (!room || room.status !== ROOM_STATUS.READY) throw { statusCode: 400, error: "INVALID_STATE", message: "Room must be full (READY) to click ready." };

        let allReady = true;
        room.participants.forEach(p => {
            if (p.userId.toString() === userId.toString()) p.isReady = true;
            if (!p.isReady) allReady = false;
        });

        if (room.participants.length < 2) allReady = false;

        let gameStart = false;
        if (allReady) {
            room.status = ROOM_STATUS.PLAYING;
            room.startedAt = new Date();
            room.currentTurnParticipantIndex = room.firstTurnParticipantIndex || 0;
            gameStart = true;
        }

        await room.save();
        return { roomId, room: RoomDTO.toRoomSummary(room), gameStart };
    },

    getGameState: async (roomId) => {
        const room = await GameRoom.findById(roomId);
        if (!room) return null;
        return RoomDTO.toGameStatePayload({ room, board: room.moves });
    }
};