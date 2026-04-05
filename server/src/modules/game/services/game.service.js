import { GameRepository } from '../repositories/game.repository.js';
import { validateGameCreation, validateGameQuery, validateObjectId } from '../validators/game.validator.js';
import crypto from 'crypto';

export const GameService = {
   

    listUserGameSessions: async (userId, query) => {
        const { filter, sort, pagination } = validateGameQuery(userId, query);
        
        const { items, total } = await GameRepository.findPaginated(filter, sort, pagination.skip, pagination.limit);
        
        return { items, pagination: { total, page: pagination.page, limit: pagination.limit } };
    },

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

    // For create online match session
    createOnlineGameSessionFromRoom: async (roomClosurePayload) => {
        if (!roomClosurePayload.sessionNumber) {
            roomClosurePayload.sessionNumber = `ONL-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
        }
        return GameRepository.createSession(roomClosurePayload);
    }
};