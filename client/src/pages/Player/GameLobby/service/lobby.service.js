/**
 * Lobby Service
 * Handles all lobby-related data and logic
 * Connects to real backend endpoints for game/room data
 */

// DEV toggle: set VITE_USE_MOCK_ROOMS=true in a .env or set localStorage key `USE_MOCK_ROOMS` to '1' to force mock data
const FORCE_USE_MOCK = (typeof import.meta !== 'undefined' && import.meta.env && String(import.meta.env.VITE_USE_MOCK_ROOMS) === 'true') || (typeof window !== 'undefined' && window.localStorage && window.localStorage.getItem('USE_MOCK_ROOMS') === '1');

import { gameLobbyService } from "./gameLobby.service";

const normalizeLobbyRoom = (room) => {
    const participants = Array.isArray(room?.participants) ? room.participants : [];
    const hostUser = participants[0] || {};
    const opponentUser = participants[1] || {};

    return {
        id: room?.id || room?._id || room?.roomNumber || Math.random().toString(36).slice(2, 9),
        roomNumber: room?.roomNumber || room?.id || (room?.roomNumber ? String(room.roomNumber) : undefined),
        boardSize: typeof room?.boardSize === 'number' ? `${room.boardSize}x${room.boardSize}` : (room?.boardSize || '10x10'),
        host: hostUser.usernameSnapshot || hostUser.username || hostUser.name || room?.host || 'HOST',
        hostRank: hostUser.rank ? `#${hostUser.rank}` : (room?.hostRank || '#000'),
        opponent: opponentUser.usernameSnapshot || opponentUser.username || opponentUser.name || (participants.length > 1 ? 'PLAYER' : 'WAITING'),
        opponentRank: opponentUser.rank ? `#${opponentUser.rank}` : (room?.opponentRank || (participants.length > 1 ? '#000' : '')),
        status: String(room?.status || 'waiting').toLowerCase(),
        players: participants.length || room?.players || 0,
        maxPlayers: room?.maxPlayers || 2,
        participantIds: participants
            .map((p) => (p.userId ? String(p.userId) : null))
            .filter(Boolean),
    };
};

export const LobbyService = {
    /**
     * Get available rooms from backend
     * Returns joinable rooms (status: WAITING)
     * Falls back to empty array if rooms endpoint not yet implemented
     */
    getRooms: async () => {
        try {
            // Fetch rooms with status filter for waiting/available rooms
            const rooms = await gameLobbyService.getRooms({ status: "ACTIVE" });
            
            // If developer explicitly requested mock rooms, return them immediately
            if (FORCE_USE_MOCK) {
                console.log('[Lobby Service] FORCE_USE_MOCK enabled, returning mock rooms');
                return LobbyService._getMockRooms();
            }
            
            // Map backend room shape to UI-friendly shape and normalize status
            const normalizedRooms = (rooms || []).map(normalizeLobbyRoom);

            console.log('[Lobby Service] Fetched rooms from backend (normalized):', normalizedRooms);

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
        return (rooms || []).filter((r) => String(r.status || '').toLowerCase() === 'waiting');
    },

    normalizeRoom: normalizeLobbyRoom,

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
                    status: "waiting",
                    opponent: 'WAITING',
                    opponentRank: '',
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
                    opponent: 'RIVAL_007',
                    opponentRank: '#204',
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
                host: "PIXEL_RANGER",
                hostRank: "#099",
                status: "waiting",
                players: 1,
                maxPlayers: 2,
            },
        ];
    },


};
