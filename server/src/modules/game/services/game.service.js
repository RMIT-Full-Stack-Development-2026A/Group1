import { GameRepository } from '../repositories/game.repository.js';
import { validateGameCreation, validateGameQuery, validateObjectId } from '../validators/game.validator.js';
import crypto from 'crypto';

export const GameService = {
    // create Local Match
    createLocalGameSession: async (userId, payload) => {
        const validationErrors = validateGameCreation(payload);
        if (validationErrors.length > 0) {
            throw {
                statusCode: 400,
                error: "VALIDATION_ERROR",
                message: "Invalid game session data provided.",
                cause: "Payload failed validation rules.",
                valid_example: "{ gameType: 'SINGLE_PLAYER', status: 'FINISHED', participants: [...] }",
                details: validationErrors
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

        return await GameRepository.createSession(sessionData);
    },

    // get game list
    listUserGameSessions: async (userId, query) => {
        const { filter, sort, pagination } = validateGameQuery(userId, query);
        
        const { items, total } = await GameRepository.findPaginated(filter, sort, pagination.skip, pagination.limit);
        
        return { items, pagination: { total, page: pagination.page, limit: pagination.limit } };
    },

    // get game detail 
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

        return session;
    },

    // Create Game Online
    createOnlineGameSessionFromRoom: async (roomClosurePayload) => {
        if (!roomClosurePayload.sessionNumber) {
            roomClosurePayload.sessionNumber = `ONL-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
        }
        return GameRepository.createSession(roomClosurePayload);
    }
};