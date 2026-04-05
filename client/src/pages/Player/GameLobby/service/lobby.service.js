/**
 * Lobby Service
 * Handles all lobby-related data and logic
 */

export const LobbyService = {
    /**
     * Get mock rooms data
     * In production, this would call an API endpoint
     */
    getRooms: () => {
        return [
            {
                id: 1,
                roomNumber: 42,
                boardSize: "10x10",
                host: "PLAYER_ONE",
                hostRank: "#085",
                status: "waiting",
                players: 1,
                maxPlayers: 2,
            },
            {
                id: 2,
                roomNumber: 45,
                boardSize: "15x15",
                host: "NEON_PHANTOM",
                hostRank: "#042",
                status: "waiting",
                players: 1,
                maxPlayers: 2,
            },
            {
                id: 3,
                roomNumber: 39,
                boardSize: "10x10",
                host: "HOST_X",
                hostRank: "#151",
                status: "full",
                players: 2,
                maxPlayers: 2,
            },
            {
                id: 4,
                roomNumber: 46,
                boardSize: "10x10",
                host: "CYBER_KING",
                hostRank: "#037",
                status: "waiting",
                players: 1,
                maxPlayers: 2,
            },
            {
                id: 5,
                roomNumber: 47,
                boardSize: "15x15",
                host: "ZERO_COOL",
                hostRank: "#089",
                status: "waiting",
                players: 1,
                maxPlayers: 2,
            },
            {
                id: 6,
                roomNumber: 48,
                boardSize: "10x10",
                host: "BIT_CRUSHER",
                hostRank: "#076",
                status: "waiting",
                players: 1,
                maxPlayers: 2,
            },
        ];
    },

    /**
     * Get player stats
     * In production, this would call an API endpoint
     */
    getPlayerStats: () => {
        return {
            wins: 42,
            losses: 12,
            rank: "#085 ELITE",
            totalGames: 54,
            winRate: "77.8%",
        };
    },

    /**
     * Get recent activity
     * In production, this would call an API endpoint
     */
    getRecentActivity: () => {
        return [
            { time: "14:22", action: "MATCH_WON", opponent: "USER_77", type: "win" },
            { time: "14:05", action: "ENTERED_LOBBY", type: "neutral" },
            { time: "13:58", action: "LEVEL_UP", level: "LVL 14", type: "level" },
            { time: "13:45", action: "MATCH_LOST", opponent: "USER_53", type: "loss" },
        ];
    },

    /**
     * Get available rooms (filter by status)
     */
    getAvailableRooms: (rooms) => {
        return rooms.filter((r) => r.status === "waiting");
    },

    /**
     * Get online player count
     */
    getOnlineCount: () => {
        return 24;
    },
};
