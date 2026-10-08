import http from "@/utils/httpHelper";
import { API_ENDPOINTS } from "@/config/apiConfig";

const unwrap = (response) => ({
  data: response?.data || response || {},
});

export const gameRoomMonitorService = {
  async getRooms() {
    return unwrap(await http.get(API_ENDPOINTS.ADMIN.ROOMS));
  },

  async closeRoom(roomId) {
    return unwrap(await http.delete(API_ENDPOINTS.ADMIN.CLOSE_ROOM(roomId)));
  },

  async getSessions(params = {}) {
    return unwrap(await http.get(API_ENDPOINTS.ADMIN.SESSIONS, params));
  },
};
