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
            
            console.log('[Game Lobby Service] Fetched games:', response);
            
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
     * Get single game session detail with replay data
     * @param {string} gameId - Game session ID
     * @returns {Promise<Object>} - Game detail including moves and board state
     */
    getGameDetail: async (gameId) => {
        try {
            const response = await http.get(API_ENDPOINTS.GAME.DETAILS(gameId));
            
            console.log('[Game Lobby Service] Fetched game detail:', response);
            
            return response.data;
        } catch (error) {
            console.error('[Game Lobby Service] Failed to fetch game detail:', error);
            throw error;
        }
    },

    /**
     * Create a local/AI game session
     * @param {Object} gameData - { gameType, boardSize, status, participants, moves, etc. }
     * @returns {Promise<Object>} - Created game session
     */
    createLocalGame: async (gameData) => {
        try {
            const response = await http.post(API_ENDPOINTS.GAME.LIST, gameData);
            
            console.log('[Game Lobby Service] Created local game:', response);
            
            return response.data;
        } catch (error) {
            console.error('[Game Lobby Service] Failed to create local game:', error);
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
            
            console.log('[Game Lobby Service] Fetched rooms:', response);
            
            return response?.data || response || {
                items: [],
                total: 0,
                page: 1,
                limit: 20,
            };
        } catch (error) {
            console.error('[Game Lobby Service] Failed to fetch rooms:', error);
            // Return empty paginated payload as fallback for now (rooms endpoint not yet implemented)
            return {
                items: [],
                total: 0,
                page: 1,
                limit: 20,
            };
        }
    },

    /**
     * Get single room detail for reconnect/recovery
     * @param {string} roomId - Room ID
     * @returns {Promise<Object>} - Room detail
     */
    getRoomDetail: async (roomId) => {
        try {
            const response = await http.get(API_ENDPOINTS.ROOM.DETAILS(roomId));
            
            console.log('[Game Lobby Service] Fetched room detail:', response);
            
            return response.data;
        } catch (error) {
            console.error('[Game Lobby Service] Failed to fetch room detail:', error);
            throw error;
        }
    },

    /**
     * Join an existing room
     * @param {string} roomId - Room ID to join
     * @returns {Promise<Object>} - Updated room data
     */
    joinRoom: async (roomId) => {
        try {
            const response = await http.post(API_ENDPOINTS.ROOM.JOIN(roomId));
            
            console.log('[Game Lobby Service] Joined room:', response);
            
            return response.data;
        } catch (error) {
            console.error('[Game Lobby Service] Failed to join room:', error);
            throw error;
        }
    },

    /**
     * Create a new game room
     * @param {Object} roomData - { boardSize, marker }
     * @returns {Promise<Object>} - Created room data
     */
    createRoom: async (roomData) => {
        try {
            const response = await http.post(API_ENDPOINTS.ROOM.CREATE, roomData);
            
            console.log('[Game Lobby Service] Created room:', response);
            
            return response.data;
        } catch (error) {
            console.error('[Game Lobby Service] Failed to create room:', error);
            throw error;
        }
    },
};
