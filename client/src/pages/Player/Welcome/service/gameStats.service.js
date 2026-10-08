import http from "@/utils/httpHelper";
import { API_ENDPOINTS } from "@/config/apiConfig";

/**
 * Fetches the real total number of matches played on the platform.
 * Backend: GET /api/v1/games/stats/total (see server/src/modules/game).
 * @returns {Promise<number>}
 */
export const getTotalMatchesPlayed = async () => {
  const response = await http.get(API_ENDPOINTS.GAME.TOTAL_MATCHES, {}, { silent: true });
  return response?.data?.total ?? 0;
};
