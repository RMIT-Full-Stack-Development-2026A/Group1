/**
 * Lobby Service
 * Handles all lobby-related data and logic
 * Connects to real backend endpoints for game/room data
 */

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
        hostAvatarUrl: hostUser.avatarSnapshot || hostUser.avatar || room?.hostAvatarUrl || null,
        hostUserId: hostUser.userId ? String(hostUser.userId) : (room?.hostUserId || room?.hostRank || '#000'),
        hostRank: hostUser.rank ? `#${hostUser.rank}` : (room?.hostRank || ''),
        opponent: opponentUser.usernameSnapshot || opponentUser.username || opponentUser.name || (participants.length > 1 ? 'PLAYER' : 'WAITING'),
        opponentAvatarUrl: opponentUser.avatarSnapshot || opponentUser.avatar || room?.opponentAvatarUrl || null,
        opponentUserId: opponentUser.userId ? String(opponentUser.userId) : (room?.opponentUserId || room?.opponentRank || (participants.length > 1 ? '#000' : '')),
        opponentRank: opponentUser.rank ? `#${opponentUser.rank}` : (room?.opponentRank || ''),
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
     * Get rooms from the backend (paginated). Errors are thrown so the lobby can show its error state.
     */
    getRooms: async ({ page = 1, limit = 6, status, boardSize } = {}) => {
        const requestParams = {
            page,
            limit,
            ...(status && { status }),
            ...(boardSize && { boardSize }),
        };

        const response = await gameLobbyService.getRooms(requestParams);

        // Map backend room shape to UI-friendly shape and normalize status
        const payload = response?.data || response || {};
        const normalizedRooms = (payload.items || []).map(normalizeLobbyRoom);

        return {
            items: normalizedRooms,
            total: Number(payload.total || normalizedRooms.length || 0),
            page: Number(payload.page || page || 1),
            limit: Number(payload.limit || limit || 6),
        };
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
            const activity = games.items?.slice(0, 4).map((game) => {
                const formatTime = (date) => {
                    const d = new Date(date);
                    return d.toLocaleTimeString(undefined, { 
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

            
            return activity.length > 0 ? activity : [];
        } catch (error) {
            console.error('[Lobby Service] Failed to fetch recent activity:', error);
            return [];
        }
    },
};
