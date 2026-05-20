import http from "@/utils/httpHelper";
import { API_ENDPOINTS } from "@/config/apiConfig";

const USE_MOCK_ROOMS = import.meta.env.VITE_USE_MOCK_ROOMS === "true";

const MOCK_ROOMS = [
  {
    id: 1,
    roomNumber: 42,
    boardSize: "10x10",
    participants: [
      { usernameSnapshot: "PLAYER_ONE", mark: "X", isHost: true },
    ],
    createdAt: "2026-05-10T08:15:00.000Z",
    startedAt: null,
    endedAt: null,
    status: "WAITING",
  },
  {
    id: 2,
    roomNumber: 45,
    boardSize: "15x15",
    participants: [
      { usernameSnapshot: "NEON_PHANTOM", mark: "X", isHost: true },
    ],
    createdAt: "2026-05-10T08:45:00.000Z",
    startedAt: null,
    endedAt: null,
    status: "WAITING",
  },
  {
    id: 3,
    roomNumber: 39,
    boardSize: "10x10",
    participants: [
      { usernameSnapshot: "HOST_X", mark: "X", isHost: true },
      { usernameSnapshot: "RIVAL_007", mark: "O", isHost: false },
    ],
    createdAt: "2026-05-10T07:40:00.000Z",
    startedAt: "2026-05-10T07:45:00.000Z",
    endedAt: null,
    status: "PLAYING",
  },
  {
    id: 4,
    roomNumber: 46,
    boardSize: "10x10",
    participants: [
      { usernameSnapshot: "CYBER_KING", mark: "X", isHost: true },
    ],
    createdAt: "2026-05-10T09:05:00.000Z",
    startedAt: null,
    endedAt: null,
    status: "WAITING",
  },
  {
    id: 5,
    roomNumber: 47,
    boardSize: "15x15",
    participants: [
      { usernameSnapshot: "PIXEL_RANGER", mark: "X", isHost: true },
    ],
    createdAt: "2026-05-10T09:25:00.000Z",
    startedAt: null,
    endedAt: null,
    status: "WAITING",
  },
  {
    id: 6,
    roomNumber: 31,
    boardSize: "10x10",
    participants: [
      { usernameSnapshot: "NOVA_ALPHA", mark: "X", isHost: true },
      { usernameSnapshot: "ION_RUSH", mark: "O", isHost: false },
    ],
    createdAt: "2026-05-10T06:35:00.000Z",
    startedAt: "2026-05-10T06:38:00.000Z",
    endedAt: "2026-05-10T06:58:00.000Z",
    status: "CLOSED",
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
      const response = await http.delete(API_ENDPOINTS.ADMIN.CLOSE_ROOM(roomId));

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

  async getSessions(params = {}) {
    if (!USE_MOCK_ROOMS) {
      const response = await http.get(API_ENDPOINTS.ADMIN.SESSIONS, params);

      return {
        data: response?.data || response || {},
      };
    }

    return {
      data: {
        items: [],
        total: 0,
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
