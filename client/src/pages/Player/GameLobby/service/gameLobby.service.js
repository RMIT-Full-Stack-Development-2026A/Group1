/**
 * Game Lobby Service
 * Handles all game lobby and room-related API calls
 */

import http from "@/utils/httpHelper";
import { API_ENDPOINTS } from "@/config/apiConfig";

export const gameLobbyService = {
    /**
     * Get list of game sessions (game history)
     * @param {Object} options - { page, limit, gameType, result, q, sortBy, sortOrder }
     * @returns {Promise<Object>} - { items, total, page, limit }
     */
    getGames: async (options = {}) => {
        try {
            // Build query string from options
            const params = {
                page: options.page || 1,
                limit: options.limit || 20,
                ...(options.gameType && { gameType: options.gameType }),
                ...(options.result && { result: options.result }),
                ...(options.q && { q: options.q }),
                ...(options.sortBy && { sortBy: options.sortBy }),
                ...(options.sortOrder && { sortOrder: options.sortOrder }),
            };

            const response = await http.get(API_ENDPOINTS.GAME.LIST, params);
            
            return response.data || {
                items: [],
                total: 0,
                page: 1,
                limit: 20,
            };
        } catch (error) {
            console.error('[Game Lobby Service] Failed to fetch games:', error);
            throw error;
        }
    },

    /**
     * Get available rooms snapshot (for lobby)
     * @param {Object} options - { status, boardSize, page, limit }
     * @returns {Promise<Array>} - List of available rooms
     */
    getRooms: async (options = {}) => {
        try {
            const params = {
                ...(options.status && { status: options.status }),
                ...(options.boardSize && { boardSize: options.boardSize }),
                ...(options.page && { page: options.page }),
                ...(options.limit && { limit: options.limit }),
            };

            const response = await http.get(API_ENDPOINTS.ROOM.LIST, params);
            
            return response?.data || response || {
                items: [],
                total: 0,
                page: 1,
                limit: 20,
            };
        } catch (error) {
            console.error('[Game Lobby Service] Failed to fetch rooms:', error);
            throw error;
        }
    },
};
