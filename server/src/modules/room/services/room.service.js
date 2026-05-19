import { RoomRepository } from '../repositories/room.repository.js';
import { RoomDTO } from '../dtos/room.dto.js';
import { GameInterface } from '../../game/interfaces/game.interface.js';
import { AuthInterface } from '../../auth/interfaces/auth.interface.js';
import { ROOM_STATUS } from '../constants/room.constants.js';
import { GameRoom } from '../models/gameRoom.model.js';
import { checkGomokuWin } from '../../../utils/gomoku.util.js';
import { 
    validateRoomQuery, validateObjectId, validateRoomCreate, validateRoomJoin, 
    validateRoomLeave, validateGameMove, validateChatSend, 
    validateRoomUpdateSettings, validateRoomSetFirstTurn, validateRoomReady 
} from '../validators/room.validator.js';

import { eventBus } from '../../../utils/eventBus.util.js';
import { SYSTEM_EVENTS } from '../../../utils/constants/event.containts.js';

// Compute isPremium from user
const computeIsPremium = (user) => !!(user.premiumExpiresAt && user.premiumExpiresAt > new Date());

export const RoomService = {
     // [GET] /rooms endpoint
    getArenaRooms: async (query, requestingUser) => {
        const { filter, sort, pagination } = validateRoomQuery(query, requestingUser);
        
        const { rooms, total } = await RoomRepository.findPaginated(filter, sort, pagination.skip, pagination.limit);
        
        return RoomDTO.toRoomListResponse(rooms, { 
            total, 
            page: pagination.page, 
            limit: pagination.limit 
        });
    },

     // [GET] /rooms/:id endpoint
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

    /** Retrieves active room summary. */
    getActiveRoomSummaryByUserId: async (userId) => {
        const room = await RoomRepository.findActiveRoomByUserId(userId);
        return room ? RoomDTO.toActiveRoomSummary(room) : null;
    },

    /** Retrieves active rooms count. */
    getActiveRoomsCount: async () => {
        return RoomRepository.countActiveRooms();
    },

    /** Retrieves paginated rooms for admin. */
    getPaginatedRooms: async (filter, sort, skip, limit) => {
        const { rooms, total } = await RoomRepository.findPaginated(filter, sort, skip, limit);
        const page = limit > 0 ? Math.floor(skip / limit) + 1 : 1;
        return RoomDTO.toRoomListResponse(rooms, {
            total,
            page,
            limit
        });
    },

    /** Forces room closure. */
    forceCloseRoomByAdmin: async (roomId) => {
        const room = await RoomRepository.findById(roomId);

        if (!room) {
            throw {
                statusCode: 404,
                error: "ROOM_NOT_FOUND",
                message: "Room not found.",
                cause: `No room record exists matching the ID: ${roomId}.`
            };
        }

        if (['CLOSED', 'ABORTED'].includes(room.status)) {
            throw {
                statusCode: 409,
                error: "ROOM_ALREADY_CLOSED",
                message: "Room is already closed or aborted.",
                cause: `The room ID ${roomId} is currently in a ${room.status} state.`
            };
        }

        const closedAt = new Date();

        const closedRoom = await RoomRepository.updateRoomStatus(roomId, {
            status: 'CLOSED',
            closedBy: 'ADMIN',
            endedAt: closedAt
        });

        if (!closedRoom) {
            throw {
                statusCode: 500,
                error: "UPDATE_FAILED",
                message: "Failed to force close the room.",
                cause: "The room status update failed unexpectedly due to a concurrent database modification.",
                valid_example: "Please try the request again."
            }; 
        }

        if (room.status === 'PLAYING') {
            const firstTurnParticipantIndex = room.moves?.length
                ? (room.moves[0]?.byParticipantIndex ?? 0)
                : (room.currentTurnParticipantIndex || 0);

            await GameInterface.createOnlineGameSessionFromRoom({
                sourceRoomId: room._id,
                gameType: 'ONLINE_MATCH',
                boardSize: room.boardSize,
                participants: room.participants.map(p => ({ 
                    userId: p.userId, 
                    usernameSnapshot: p.usernameSnapshot, 
                    avatarSnapshot: p.avatarSnapshot ?? null,
                    isPremiumSnapshot: p.isPremiumSnapshot ?? false,
                    mark: p.mark, 
                    markerStyle: p.markerStyle ?? 'CLASSIC',
                    role: 'HUMAN'
                })),
                firstTurnParticipantIndex,
                status: 'ABORTED',
                endedReason: 'ADMIN_FORCE_CLOSE',
                moves: room.moves,
                totalMoves: room.moveCount,
                startedAt: room.startedAt,
                endedAt: closedAt
            });
        }

        // Signal the Socket layer to kick the players out
        eventBus.publish(SYSTEM_EVENTS.ROOM_FORCE_CLOSED, { 
            roomId: String(roomId),
            endedAt: closedAt 
        });
        
        return true;
    },

    // =========================
    // --- WEBSOCKET METHODS ---
    // =========================
    /** Handles room creation. */
    handleRoomCreate: async (userId, payload) => {
        const { boardSize, marker, boardStyle, markerStyle } = validateRoomCreate(payload);

        const existingRoom = await RoomRepository.findActiveRoomByUserId(userId);
        if (existingRoom) {
            throw { statusCode: 400, error: "ALREADY_IN_ROOM", message: "You are already in an active room." };
        }

        const user = await AuthInterface.getUserById(userId);
        
        const newRoomData = {
            boardSize,
            boardStyle,
            firstTurnParticipantIndex: 0,
            status: ROOM_STATUS.WAITING,
            participants: [{
                userId: user._id,
                usernameSnapshot: user.username,
                avatarSnapshot: user.avatar,
                isPremiumSnapshot: computeIsPremium(user),
                mark: marker,
                markerStyle,
                joinedAt: new Date(),
                isHost: true,
                isReady: false
            }]
        };

        const room = await RoomRepository.createRoom(newRoomData);
        return RoomDTO.toSocketRoomCreated(room);
    },

    /** Handles room join. */
    handleRoomJoin: async (userId, payload) => {
        const { roomId, markerStyle: joinerMarkerStyle = 'CLASSIC' } = validateRoomJoin(payload);

        const room = await RoomRepository.findById(roomId);
        if (!room) throw { statusCode: 404, error: "ROOM_NOT_FOUND", message: "Room not found." };

        // Allow to rejoin in case player diaconnect
        const isExistingParticipant = room.participants.some((p) => p.userId.toString() === userId.toString());
        if (room.status === ROOM_STATUS.PLAYING && isExistingParticipant) {
            const gameState = RoomDTO.toGameStatePayload({ room, board: room.moves });
            return {
                action: 'rejoined',
                room: RoomDTO.toRoomSummary(room),
                gameState,
            }
        };
        
        if (room.status !== ROOM_STATUS.WAITING) {
            throw { statusCode: 400, error: "ROOM_NOT_WAITING", message: "Room is already full or playing." };
        };
        
        if (room.participants[0].userId.toString() === userId.toString()) {
            throw { statusCode: 400, error: "ALREADY_IN_ROOM", message: "You are already in this room." };
        }

        const user = await AuthInterface.getUserById(userId);
        const hostMark = room.participants[0].mark;
        const joinerMark = hostMark === 'X' ? 'O' : 'X';

        const updatedRoom = await RoomRepository.addParticipant(roomId, {
            userId: user._id,
            usernameSnapshot: user.username,
            avatarSnapshot: user.avatar,
            isPremiumSnapshot: computeIsPremium(user),
            mark: joinerMark,
            markerStyle: joinerMarkerStyle,
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

    /** Handles game moves. */
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

        if (room.moves.some(m => m.row === row && m.col === col)) {
            throw { statusCode: 400, error: "INVALID_MOVE", message: "Cell is already occupied." };
        }

        const coordinate = `${String.fromCharCode(65 + col)}${row + 1}`;
        const newMove = { 
            moveNumber: room.moveCount + 1, 
            byParticipantIndex: pIndex, 
            row, col, coordinate, 
            placedAt: new Date() 
        };

        const nextTurn = pIndex === 0 ? 1 : 0;
        let updatedRoom = await RoomRepository.pushMove(roomId, newMove, nextTurn);

        // Check for a Gomoku win after the latest move.
        const winningLine = checkGomokuWin(updatedRoom.moves, room.boardSize, row, col, pIndex);
        const isWin = winningLine !== null;
        
        const isDraw = !isWin && updatedRoom.moveCount >= (room.boardSize * room.boardSize);

        let gameEnded = null;

        if (isWin || isDraw) {
            const endedAt = new Date();

            // Persist the finished match to GameHistory before wiping the room
            await GameInterface.createOnlineGameSessionFromRoom({
                sessionNumber: `ONL-${room.roomNumber}-${Date.now()}`, 
                sourceRoomId: room._id,
                gameType: 'ONLINE_MATCH',
                boardSize: room.boardSize,
                boardStyle: room.boardStyle,
                participants: room.participants.map(p => ({ 
                    userId: p.userId, 
                    usernameSnapshot: p.usernameSnapshot, 
                    avatarSnapshot: p.avatarSnapshot ?? null,
                    isPremiumSnapshot: p.isPremiumSnapshot ?? false,
                    mark: p.mark, 
                    role: 'HUMAN',
                    markerStyle: p.markerStyle ?? 'CLASSIC'
                })),
                firstTurnParticipantIndex: room.firstTurnParticipantIndex ?? 0,
                status: isWin ? 'FINISHED' : 'DRAW',
                endedReason: isWin ? 'WIN' : 'DRAW',
                winnerParticipantIndex: isWin ? pIndex : null,
                winningLine: winningLine || [], 
                moves: updatedRoom.moves,
                totalMoves: updatedRoom.moveCount,
                startedAt: room.startedAt,
                endedAt
            });

            const finalGameState = RoomDTO.toGameStatePayload({ room: updatedRoom, board: updatedRoom.moves });

            // Soft-reset the GameRoom to allow a rematch
            const resetParticipants = Array.isArray(updatedRoom.participants)
                ? updatedRoom.participants.map(p => ({ ...p, isReady: false }))
                : [];

            updatedRoom = await RoomRepository.updateRoomStatus(roomId, {
                status: ROOM_STATUS.READY,
                moves: [],
                moveCount: 0,
                winningLine: [], // Cleared for Rematch
                participants: resetParticipants,
                lastMove: { row: null, col: null, coordinate: null },
                startedAt: null,
                endedAt: null,
                currentTurnParticipantIndex: null
            });

            gameEnded = RoomDTO.toGameEndedPayload({
                roomId,
                winnerParticipantIndex: isWin ? pIndex : null,
                winningLine: winningLine || [],
                result: isWin ? 'WIN' : 'DRAW',
                endedAt
            });

            return {
                roomId,
                room: RoomDTO.toRoomSummary(updatedRoom),
                gameState: finalGameState, 
                gameEnded,
                rematchAvailable: true
            };
        }

        return {
            roomId,
            gameState: RoomDTO.toGameStatePayload({ room: updatedRoom, board: updatedRoom.moves }),
            gameEnded
        };
    },

    /** Handles room leave. */
    handleRoomLeave: async (userId, payload) => {
        // Validation and parsing of roomId and isTimeout flag
        const { roomId, isTimeout } = validateRoomLeave(payload);

        const room = await GameRoom.findById(roomId);
        if (!room) throw { statusCode: 404, error: "ROOM_NOT_FOUND", message: "Room not found." };

        const isParticipant = room.participants.some(p => p.userId.toString() === userId.toString());
        if (!isParticipant) return { action: 'ignored' };

        const endedAt = new Date();

        // Case 1: Leaving during an active match
        if (room.status === ROOM_STATUS.PLAYING) {
            room.status = ROOM_STATUS.ABORTED;
            room.endedAt = endedAt;
            await room.save();

            // Persist to game history
            await GameInterface.createOnlineGameSessionFromRoom({
                sessionNumber: `ONL-${room.roomNumber}-${Date.now()}`,
                sourceRoomId: room._id,
                gameType: 'ONLINE_MATCH',
                boardSize: room.boardSize,
                boardStyle: room.boardStyle,
                participants: room.participants.map(p => ({ 
                    userId: p.userId, 
                    usernameSnapshot: p.usernameSnapshot, 
                    avatarSnapshot: p.avatarSnapshot ?? null,
                    isPremiumSnapshot: p.isPremiumSnapshot ?? false,
                    mark: p.mark, 
                    role: 'HUMAN',
                    markerStyle: p.markerStyle ?? 'CLASSIC'
                })),
                firstTurnParticipantIndex: room.firstTurnParticipantIndex ?? 0,
                status: 'ABORTED',
                endedReason: 'ABORT', 
                abortedByUserId: isTimeout ? null : userId,
                moves: room.moves,
                totalMoves: room.moveCount,
                startedAt: room.startedAt ?? room.createdAt ?? endedAt,
                endedAt
            });

            await RoomRepository.deleteRoom(roomId);

            return {
                action: 'aborted',
                roomId,
                gameEnded: RoomDTO.toGameEndedPayload({
                    roomId, result: 'ABORTED', endedAt
                })
            };
        }
        
        // Case 2: Leaving from the room lobby
        const remainingParticipants = room.participants.filter(p => p.userId.toString() !== userId.toString());
        
        if (remainingParticipants.length === 0) {
            // Both players leave
            await RoomRepository.deleteRoom(roomId);
            return { action: 'removed', roomId };
        } else {
            // One player remains, promote them to host, revert to WAITING, and clear ready state
            remainingParticipants[0].isHost = true;
            remainingParticipants[0].isReady = false;
            
            room.participants = remainingParticipants;
            room.status = ROOM_STATUS.WAITING;
            await room.save();
            
            return { action: 'updated', roomId, room: RoomDTO.toRoomSummary(room) };
        }
    },

    // Delete room completely (called from socket layer for cleanup)
    forceDeleteRoom: async (roomId) => {
        await RoomRepository.deleteRoom(roomId);
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
    
    /** Handles room settings update. */
    handleUpdateSettings: async (userId, payload) => {
        const { roomId, boardStyle, markerStyle, marker } = validateRoomUpdateSettings(payload);
        const room = await GameRoom.findById(roomId);
        
        if (!room) throw { statusCode: 404, error: "ROOM_NOT_FOUND", message: "Room not found." };
        if (room.status === ROOM_STATUS.PLAYING) throw { statusCode: 400, error: "INVALID_STATE", message: "Cannot change settings while playing." };
        
        // Find the requesting player's index
        const playerIndex = room.participants.findIndex(p => p.userId.toString() === userId.toString());
        if (playerIndex === -1) throw { statusCode: 403, error: "FORBIDDEN", message: "User is not a participant of this room." };
        
        const isHost = room.participants[playerIndex].isHost;
        let hasChanged = false;
        
        // Only host can change board-level settings
        if (boardStyle !== undefined && isHost && room.boardStyle !== boardStyle) {
            room.boardStyle = boardStyle;
            hasChanged = true;
        }
        
        // Only host can change marker assignments
        if (marker !== undefined && isHost && room.participants[playerIndex].mark !== marker) {
            room.participants[playerIndex].mark = marker;
            
            // If there is another player, swap their marker
            const otherPlayerIndex = playerIndex === 0 ? 1 : 0;
            if (room.participants[otherPlayerIndex]) {
                room.participants[otherPlayerIndex].mark = marker === 'X' ? 'O' : 'X';
            }
            hasChanged = true;
        }

        // Any player can change their own markerStyle
        if (markerStyle !== undefined && room.participants[playerIndex] && room.participants[playerIndex].markerStyle !== markerStyle) {
            room.participants[playerIndex].markerStyle = markerStyle;
            hasChanged = true;
        }

        if (hasChanged) {
            // Reset ready state for both players whenever settings change
            room.participants.forEach(p => p.isReady = false);

            await room.save();
        }

        return { roomId, room: RoomDTO.toRoomSummary(room) };
    },

    /** Handles first turn assignment. */
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

    /** Handles room ready status. */
    handleRoomReady: async (userId, payload) => {
        const { roomId } = validateRoomReady(payload);
        const room = await GameRoom.findById(roomId);
        
        if (!room || room.status !== ROOM_STATUS.READY) throw { statusCode: 400, error: "INVALID_STATE", message: "Room must be full (READY) to click ready." };

        let allReady = true;
        room.participants.forEach(p => {
            if (p.userId.toString() === userId.toString()) p.isReady = true;
            if (!p.isReady) allReady = false;
        });

        // Ensure actually 2 players before starting
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

    /** Retrieves game state. */
    getGameState: async (roomId) => {
        const room = await GameRoom.findById(roomId);
        if (!room) return null;
        return RoomDTO.toGameStatePayload({ room, board: room.moves });
    }
};