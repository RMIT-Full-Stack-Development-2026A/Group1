// client/src/components/GameBoard/game.service.js
import http from '@/utils/httpHelper';
import { API_ENDPOINTS } from '@/config/apiConfig'; 

export const gameService = {
    // Send the game result to the backend
    saveGameResult: async (resultData) => {
        try {
            
            const endpoint = API_ENDPOINTS.GAME.LIST; 
            
            const response = await http.post(endpoint, resultData);
            return response;
        } catch (error) {
            console.error("Failed to save game result:", error);
            throw error;
        }
    }
};