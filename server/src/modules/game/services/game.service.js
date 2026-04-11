import crypto from 'crypto';
import { GameRepository } from '../repositories/game.repository.js';
import { GameDTO } from '../dtos/game.dto.js';
import { validateGameCreation, validateGameQuery, validateObjectId } from '../validators/game.validator.js';

export const GameService = {
    // Create Local Match
    createLocalGameSession: async (userId, payload) => {
        const validationErrors = validateGameCreation(payload);
        if (validationErrors.length > 0) {
            throw {
                statusCode: 400,
                error: "VALIDATION_ERROR",
                message: "Failed to save game session. Invalid payload.",
                cause: "One or more required fields for saving a local game are missing or malformed.",
                valid_example: "Ensure participants array has 2 elements and moves are valid.",
                details: validationErrors
            };
        }

        // Ensure the user saving the game is actually one of the participants
        const isUserParticipant = payload.participants.some(p => String(p.userId) === String(userId));
        if (!isUserParticipant) {
            throw {
                statusCode: 403,
                error: "FORBIDDEN",
                message: "Cannot save game session.",
                cause: "You can only save local or AI matches that you participated in.",
                valid_example: "Ensure your authenticated user ID is in the participants array."
            };
        }

        const sessionNumber = `GS-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
        
        const parseDateSafe = (dateString) => {
            const parsed = new Date(dateString);
            return isNaN(parsed.getTime()) ? new Date() : parsed;
        };

        const startedAt = parseDateSafe(payload.startedAt);
        const endedAt = parseDateSafe(payload.endedAt);
        const durationMs = Math.max(0, endedAt.getTime() - startedAt.getTime());
        
        const moves = Array.isArray(payload.moves) ? payload.moves : [];
        const totalMoves = moves.length;

        let endedReason = null;
        let winnerParticipantIndex = null;
        let winningLine = [];
        let abortedByUserId = null;

        switch (payload.status) {
            case 'FINISHED':
                endedReason = 'WIN';
                winnerParticipantIndex = payload.winnerParticipantIndex;
                winningLine = payload.winningLine;
                break;
            case 'DRAW':
                endedReason = 'DRAW';
                winnerParticipantIndex = null;
                winningLine = [];
                break;
            case 'ABORTED':
                endedReason = 'ABORT';
                abortedByUserId = userId; 
                winnerParticipantIndex = null;
                winningLine = [];
                break;
        }

        const sessionData = {
            sessionNumber,
            sourceRoomId: null,
            gameType: payload.gameType,
            boardSize: payload.boardSize || 10,
            
            ...(payload.boardStyle && { boardStyle: payload.boardStyle }),
            ...(payload.markerStyle && { markerStyle: payload.markerStyle }),

            participants: payload.participants,
            firstTurnParticipantIndex: payload.firstTurnParticipantIndex,
            
            status: payload.status,
            endedReason,
            winnerParticipantIndex,
            abortedByUserId,
            winningLine,
            
            moves,
            totalMoves,
            startedAt,
            endedAt,
            durationMs
        };

        const savedSession = await GameRepository.createSession(sessionData);
        return GameDTO.toGameDetail(savedSession, userId);
    },

    // Get game list
    listUserGameSessions: async (userId, query) => {
        const { filter, sort, pagination } = validateGameQuery(userId, query);
        
        const { items, total } = await GameRepository.findPaginated(filter, sort, pagination.skip, pagination.limit);
        
        return GameDTO.toGameListResponse(items, { total, page: pagination.page, limit: pagination.limit }, userId);
    },

    // Get game detail 
    getGameSessionDetail: async (userId, gameId) => {
        if (!validateObjectId(gameId)) {
            throw {
                statusCode: 400,
                error: "INVALID_IDENTIFIER",
                message: "Invalid game ID.",
                cause: "The requested ID is not a valid MongoDB ObjectId.",
                valid_example: "Use a valid 24-character hex string."
            };
        }

        const session = await GameRepository.findById(gameId);
        if (!session) {
            throw {
                statusCode: 404,
                error: "GAME_NOT_FOUND",
                message: "Game session not found.",
                cause: `No game record exists matching the ID: ${gameId}.`,
                valid_example: "Ensure the game ID is correct and belongs to a saved match."
            };
        }

        // Prevents users from fetching random replays belonging to others
        const isParticipant = session.participants.some(p => String(p.userId) === String(userId));
        if (!isParticipant) {
             throw {
                statusCode: 403,
                error: "FORBIDDEN",
                message: "Access denied to this game session.",
                cause: "You are not a participant of this match.",
                valid_example: "You can only view your own match history."
            };
        }
        
        return GameDTO.toGameDetail(session, userId);
    },

    // Interface/Cross-Module Methods
    getUserGameStats: async (userId) => {
        const stats = await GameRepository.calculateUserStats(userId);
        return GameDTO.toStatsSummary(stats);
    },

    getRecentGames: async (userId, limit = 5) => {
        const sessions = await GameRepository.findRecentGamesByUser(userId, limit);
        return Array.isArray(sessions)
            ? sessions.map((session) => GameDTO.toGameListItem(session, userId))
            : [];
    },

    createOnlineGameSessionFromRoom: async (roomClosurePayload) => {
        if (!roomClosurePayload.sessionNumber) {
            roomClosurePayload.sessionNumber = `ONL-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
        }
        const session = await GameRepository.createSession(roomClosurePayload);
        return GameDTO.toGameDetail(session, roomClosurePayload?.viewerUserId || null);
    },

    getTotalPlatformMatches: async () => {
         return GameRepository.countTotalMatches();
    }
};