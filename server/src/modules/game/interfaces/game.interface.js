import { GameService } from "../services/game.service.js";

// Interface exposes game-history and replay operations to other modules.
export const GameInterface = {
    createLocalGameSession: async (userId, payload) => GameService.createLocalGameSession(userId, payload),

    listUserGameSessions: async (userId, query) => GameService.listUserGameSessions(userId, query),

    getGameSessionDetail: async (userId, gameId) => GameService.getGameSessionDetail(userId, gameId),

    // Expose to Profile/Admin module
    getUserGameStats: async (userId) => GameService.getUserGameStats(userId),

    // Expose to only Profile module
    getRecentGames: async (userId, limit = 5) => GameService.getRecentGames(userId, limit),

    createOnlineGameSessionFromRoom: async (roomClosurePayload) => GameService.createOnlineGameSessionFromRoom(roomClosurePayload),

    // Exposes to Admin module
    getTotalPlatformMatches: async () => GameService.getTotalPlatformMatches()
};