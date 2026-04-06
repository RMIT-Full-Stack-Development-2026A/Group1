import { GameDTO } from "../dtos/game.dto.js";
import { GameRepository } from "../repositories/game.repository.js";

// Interface exposes game-history and replay operations to other modules.
export const GameInterface = {
    createLocalGameSession: async (userId, payload) => {
        const session = await GameService.createLocalGameSession(userId, payload);
        return GameDTO.toGameDetail(session, userId);
    },

    listUserGameSessions: async (userId, query) => {
        const result = await GameService.listUserGameSessions(userId, query);
        return GameDTO.toGameListResponse(result.items, result.pagination, userId);
    },

    getGameSessionDetail: async (userId, gameId) => {
        const session = await GameService.getGameSessionDetail(userId, gameId);
        if (!session) return null;

        return GameDTO.toGameDetail(session, userId);
    },

    // Expose to Profile/Admin module
    getUserGameStats: async (userId) => {
        const stats = await GameRepository.calculateUserStats(userId);
        return GameDTO.toStatsSummary(stats);
    },

    // Expose to only Profile module
    getRecentGames: async (userId, limit = 5) => {
        const sessions = await GameRepository.findRecentGamesByUser(userId, limit);
        return Array.isArray(sessions)
            ? sessions.map((session) => GameDTO.toGameListItem(session, userId))
            : [];
    },

    createOnlineGameSessionFromRoom: async (roomClosurePayload) => {
        const session = await GameService.createOnlineGameSessionFromRoom(roomClosurePayload);
        return GameDTO.toGameDetail(session, roomClosurePayload?.viewerUserId || null);
    },

    // Exposes to Admin module
    getTotalPlatformMatches: async () => {
         return GameRepository.countTotalMatches();
    }
};