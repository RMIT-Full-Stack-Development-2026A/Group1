/**
 * Lobby Service
 * Handles all lobby-related data and logic
 * Connects to real backend endpoints for game/room data
 */

import { gameLobbyService } from "./gameLobby.service";

export const LobbyService = {
    /**
     * Get available rooms from backend
     * Returns joinable rooms (status: WAITING)
     * Falls back to empty array if rooms endpoint not yet implemented
     */
    getRooms: async () => {
        try {
            // Fetch rooms with status filter for waiting/available rooms
            const rooms = await gameLobbyService.getRooms({ status: "WAITING" });
            
            // Normalize status to lowercase for UI consistency
            const normalizedRooms = rooms.map(room => ({
                ...room,
                status: room.status?.toLowerCase() || 'waiting'
            }));
            
            console.log('[Lobby Service] Fetched rooms from backend:', normalizedRooms);
            
            return normalizedRooms;
        } catch (error) {
            console.error('[Lobby Service] Failed to fetch rooms:', error);
            // Return mock data as fallback while backend is being implemented
            return LobbyService._getMockRooms();
        }
    },


    /**
     * Get recent activity from backend
     * Can be derived from game history or activity feed endpoint
     */
    getRecentActivity: async () => {
        try {
            // Fetch recent games and convert to activity format
            const games = await gameLobbyService.getGames({ 
                limit: 10,
                sortBy: 'createdAt',
                sortOrder: 'desc'
            });

            // Convert game history to activity format
            const activity = games.items?.slice(0, 4).map((game, index) => {
                const formatTime = (date) => {
                    const d = new Date(date);
                    return d.toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit'
                    }).toLowerCase();
                };

                if (game.endedReason === 'WIN') {
                    return {
                        time: formatTime(game.endedAt || game.createdAt),
                        action: "MATCH_WON",
                        opponent: game.participants?.[1]?.username || "Unknown",
                        type: "win"
                    };
                } else if (game.endedReason === 'DRAW') {
                    return {
                        time: formatTime(game.endedAt || game.createdAt),
                        action: "MATCH_DRAW",
                        opponent: game.participants?.[1]?.username || "Unknown",
                        type: "neutral"
                    };
                } else if (game.endedReason === 'ABORT') {
                    return {
                        time: formatTime(game.endedAt || game.createdAt),
                        action: "MATCH_ABORTED",
                        opponent: game.participants?.[1]?.username || "Unknown",
                        type: "loss"
                    };
                }
                return null;
            }).filter(Boolean);

            console.log('[Lobby Service] Fetched recent activity:', activity);
            
            return activity.length > 0 ? activity : [];
        } catch (error) {
            console.error('[Lobby Service] Failed to fetch recent activity:', error);
            return [];
        }
    },

    /**
     * Get available rooms (filter by status)
     */
    getAvailableRooms: (rooms) => {
        return rooms.filter((r) => r.status === "WAITING" || r.status === "waiting");
    },

    /**
     * Get online player count
     * Counts the total number of rooms available from the backend
     */
    getOnlineCount: (rooms = []) => {
        // Return the count of rooms from the backend
        return Array.isArray(rooms) ? rooms.length : 0;
    },

    // ===== MOCK DATA (Fallback) =====
    _getMockRooms: () => {
        return [
            {
                id: 1,
                roomNumber: 42,
                boardSize: "10x10",
                host: "PLAYER_ONE",
                hostRank: "#085",
                status: "WAITING",
                players: 1,
                maxPlayers: 2,
            },
            {
                id: 2,
                roomNumber: 45,
                boardSize: "15x15",
                host: "NEON_PHANTOM",
                hostRank: "#042",
                status: "WAITING",
                players: 1,
                maxPlayers: 2,
            },
            {
                id: 3,
                roomNumber: 39,
                boardSize: "10x10",
                host: "HOST_X",
                hostRank: "#151",
                status: "FULL",
                players: 2,
                maxPlayers: 2,
            },
            {
                id: 4,
                roomNumber: 46,
                boardSize: "10x10",
                host: "CYBER_KING",
                hostRank: "#037",
                status: "WAITING",
                players: 1,
                maxPlayers: 2,
            },
        ];
    },


};
