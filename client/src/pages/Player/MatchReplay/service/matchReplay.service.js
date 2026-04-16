import http from '@/utils/httpHelper';
import { API_ENDPOINTS } from '@/config/apiConfig';

export const matchReplayService = {
  getReplayById: async (gameId) => {
    return http.get(API_ENDPOINTS.GAME.DETAILS(gameId));
  }
};