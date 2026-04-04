import { GameRepository } from '../repositories/game.repository.js';
import { validateGameCreation, validateGameQuery, validateObjectId } from '../validators/game.validator.js';
import crypto from 'crypto';

export const GameService = {
    createLocalGameSession: async (userId, payload) => {
        return;
    },

    getGameSessionDetail: async (userId, gameId) => {
        return;
    },

    createOnlineGameSessionFromRoom: async (roomClosurePayload) => {
       return;
    }
};