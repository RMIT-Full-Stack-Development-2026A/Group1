import { GameRepository } from '../repositories/game.repository.js';
import { validateGameCreation, validateGameQuery, validateObjectId } from '../validators/game.validator.js';
import crypto from 'crypto';

export const GameService = {
    createLocalGameSession: async (userId, payload) => {
        // Call validator to check payload structure and rules
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

        // Validate dates
        const sessionNumber = `GS-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
        
        const parseDateSafe = (dateString) => {
            const parsed = new Date(dateString);
            return isNaN(parsed.getTime()) ? new Date() : parsed;
        };

        const startedAt = parseDateSafe(payload.startedAt);
        const endedAt = parseDateSafe(payload.endedAt);
        const durationMs = Math.max(0, endedAt.getTime() - startedAt.getTime()); // Ensure duration cannot be negative
        
        // Handle aborted match
        const moves = Array.isArray(payload.moves) ? payload.moves : [];
        const totalMoves = moves.length;

        // Determine values based on game status
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
                // Handle frontend input
                winnerParticipantIndex = null;
                winningLine = [];
                break;
            case 'ABORTED':
                endedReason = 'ABORT';
                // The user calling the API (userId) is the one who aborted this Local/AI match
                abortedByUserId = userId; 
                winnerParticipantIndex = null;
                winningLine = [];
                break;
        }

        // 4. Map clean data 100% (Layer 4 Shield: Anti Prototype Pollution)
        const sessionData = {
            sessionNumber,
            sourceRoomId: null, // Local/AI games by default do not have a Room
            gameType: payload.gameType,
            boardSize: payload.boardSize || 10,
            
            // Smart handling: Theme not finalized yet, if FE sends then use it, otherwise let Mongo use default
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

        // 5. Call repository to save to database
        return await GameRepository.createSession(sessionData);
    },

    getGameSessionDetail: async (userId, gameId) => {
        // TODO: Implement by Thắng PM
        return;
    },

    createOnlineGameSessionFromRoom: async (roomClosurePayload) => {
       // TODO: Implement by Thắng PM
       return;
    }
};