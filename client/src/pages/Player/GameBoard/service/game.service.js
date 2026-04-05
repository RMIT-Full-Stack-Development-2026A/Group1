// client/src/components/GameBoard/game.service.js
import http from '@/utils/httpHelper';
import apiConfig from '@/config/apiConfig'; 

export const gameService = {
    // Send the game result to the backend
    saveGameResult: async (resultData) => {
        try {
            
            // TODO: Change to real API to save result
            const endpoint = '/game/save-result'; 
            // TODO: Change to real API to save result
            
            const response = await http.post(endpoint, resultData);
            return response;
        } catch (error) {
            console.error("Failed to save game result:", error);
            throw error;
        }
    }
};