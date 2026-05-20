import { ulid } from 'ulid';
import { GameRepository } from '../repositories/game.repository.js';
import { GameDTO } from '../dtos/game.dto.js';
import { validateGameCreation, validateGameQuery, validateObjectId } from '../validators/game.validator.js';

export const GameService = {
    // [POST] /games endpoint
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

        const sessionNumber = `GS-${ulid()}`;
        
        const parseDateSafe = (dateString) => {
            const parsed = new Date(dateString);
            return isNaN(parsed.getTime()) ? new Date() : parsed;
        };

        const startedAt = parseDateSafe(payload.startedAt);
        const endedAt = parseDateSafe(payload.endedAt);
        const durationMs = Math.max(0, endedAt.getTime() - startedAt.getTime());
        
        const moves = Array.isArray(payload.moves) ? payload.moves : [];
        const totalMoves = moves.length;

        const DEFAULT_BOT_AVATAR = null;
        const normalizeParticipants = (parts = []) => (Array.isArray(parts) ? parts.map(p => ({
            userId: p.userId ?? null,
            usernameSnapshot: p.usernameSnapshot,
            avatarSnapshot: p.avatarSnapshot ?? (p.role === 'AI' ? DEFAULT_BOT_AVATAR : null),
            isPremiumSnapshot: p.isPremiumSnapshot ?? false, 
            role: p.role,
            mark: p.mark,
            markerStyle: p.markerStyle ?? 'CLASSIC',
            aiDifficulty: p.aiDifficulty ?? null
        })) : []);

        const participants = normalizeParticipants(payload.participants);

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

            participants: participants,
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

    // [GET] /games endpoint
    listUserGameSessions: async (userId, query) => {
        const { filter, sort, pagination } = validateGameQuery(query, userId);
        
        const { items, total } = await GameRepository.findPaginated(filter, sort, pagination.skip, pagination.limit);
        
        return GameDTO.toGameListResponse(items, { total, page: pagination.page, limit: pagination.limit }, userId);
    },

    // [GET] /games/:id endpoint
    getGameSessionDetail: async (userId, gameId, viewerContext = {}) => {
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

        // Premium users can open shared replay links
        const isParticipant = session.participants.some(p => String(p.userId) === String(userId));
        const canViewReplay = isParticipant || viewerContext.isPremium === true || viewerContext.role === 'ADMIN';

        if (!canViewReplay) {
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

    //===============================
    // Interface/Cross-Module Methods
    //===============================
    /** Retrieves user game stats. */
    getUserGameStats: async (userId) => {
        const stats = await GameRepository.calculateUserStats(userId);
        return GameDTO.toStatsSummary(stats);
    },

    /** Retrieves recent games for a user. */
    getRecentGames: async (userId, limit = 5) => {
        const sessions = await GameRepository.findRecentGamesByUser(userId, limit);
        return Array.isArray(sessions)
            ? sessions.map((session) => GameDTO.toGameListItem(session, userId))
            : [];
    },

    /** Creates an online session from a room closure. */
    createOnlineGameSessionFromRoom: async (roomClosurePayload) => {
        const normalizedParticipants = Array.isArray(roomClosurePayload?.participants)
            ? roomClosurePayload.participants.map((participant) => ({
                ...participant,
                markerStyle: participant?.markerStyle ?? 'CLASSIC'
            }))
            : [];

        const sessionPayload = {
            ...roomClosurePayload,
            participants: normalizedParticipants
        };

        if (!sessionPayload.sessionNumber) {
            sessionPayload.sessionNumber = `ONL-${ulid()}`;
        }

        const session = await GameRepository.createSession(sessionPayload);
        return GameDTO.toGameDetail(session, roomClosurePayload?.viewerUserId || null);
    },

    /** Retrieves total platform match count. */
    getTotalPlatformMatches: async () => {
         return GameRepository.countTotalMatches();
    }
};