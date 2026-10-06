import { GameService } from "../services/game.service.js";

// Only operations consumed by other modules belong in this interface.
export const GameInterface = {
    listUserGameSessions: async (userId, query) => GameService.listUserGameSessions(userId, query),

    // Expose to Profile/Admin module
    getUserGameStats: async (userId) => GameService.getUserGameStats(userId),

    // Expose to only Profile module
    getRecentGames: async (userId, limit = 5) => GameService.getRecentGames(userId, limit),

    createOnlineGameSessionFromRoom: async (roomClosurePayload) => GameService.createOnlineGameSessionFromRoom(roomClosurePayload),

    // Exposes to Admin module
    getTotalPlatformMatches: async () => GameService.getTotalPlatformMatches()
};