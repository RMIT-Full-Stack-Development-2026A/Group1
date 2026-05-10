import http from "@/utils/httpHelper";
import { API_ENDPOINTS } from "@/config/apiConfig";

const USE_MOCK_ROOMS = import.meta.env.VITE_USE_MOCK_ROOMS === "true";

const MOCK_ROOMS = [
  {
    id: 1,
    roomNumber: 42,
    boardSize: "10x10",
    playerOneName: "PLAYER_ONE",
    playerTwoName: "WAITING",
    startTime: "2026-05-10T08:15:00.000Z",
    endTime: null,
    status: "waiting",
  },
  {
    id: 2,
    roomNumber: 45,
    boardSize: "15x15",
    playerOneName: "NEON_PHANTOM",
    playerTwoName: "WAITING",
    startTime: "2026-05-10T08:45:00.000Z",
    endTime: null,
    status: "waiting",
  },
  {
    id: 3,
    roomNumber: 39,
    boardSize: "10x10",
    playerOneName: "HOST_X",
    playerTwoName: "RIVAL_007",
    startTime: "2026-05-10T07:40:00.000Z",
    endTime: null,
    status: "in-progress",
  },
  {
    id: 4,
    roomNumber: 46,
    boardSize: "10x10",
    playerOneName: "CYBER_KING",
    playerTwoName: "WAITING",
    startTime: "2026-05-10T09:05:00.000Z",
    endTime: null,
    status: "waiting",
  },
  {
    id: 5,
    roomNumber: 47,
    boardSize: "15x15",
    playerOneName: "PIXEL_RANGER",
    playerTwoName: "WAITING",
    startTime: "2026-05-10T09:25:00.000Z",
    endTime: null,
    status: "waiting",
  },
  {
    id: 6,
    roomNumber: 31,
    boardSize: "10x10",
    playerOneName: "NOVA_ALPHA",
    playerTwoName: "ION_RUSH",
    startTime: "2026-05-10T06:35:00.000Z",
    endTime: "2026-05-10T06:58:00.000Z",
    status: "closed",
  },
];

const cloneRoom = (room) => ({ ...room });

let mockRooms = MOCK_ROOMS.map(cloneRoom);

export const gameRoomMonitorService = {
  async getRooms() {
    if (!USE_MOCK_ROOMS) {
      const response = await http.get(API_ENDPOINTS.ADMIN.ROOMS);

      return {
        data: response?.data || response || {},
      };
    }

    return {
      data: {
        items: mockRooms.map(cloneRoom),
        total: mockRooms.length,
      },
    };
  },

  async closeRoom(roomId) {
    if (!USE_MOCK_ROOMS) {
      const response = await http.patch(API_ENDPOINTS.ADMIN.CLOSE_ROOM(roomId), {});

      return {
        data: response?.data || response || {},
      };
    }

    const closedAt = new Date().toISOString();

    mockRooms = mockRooms.map((room) =>
      room.id === roomId && room.status !== "closed"
        ? {
            ...room,
            status: "closed",
            endTime: closedAt,
          }
        : room
    );

    const room = mockRooms.find((item) => item.id === roomId);

    return {
      data: {
        room: room ? cloneRoom(room) : null,
      },
    };
  },

  resetMockRooms() {
    if (!USE_MOCK_ROOMS) {
      return;
    }

    mockRooms = MOCK_ROOMS.map(cloneRoom);
  },
};
