import { AdminService } from "../services/admin.service.js";
import { AdminDTO } from "../dtos/admin.dto.js";

// Interface exposes admin-facing orchestration results across module boundaries.
export const AdminInterface = {
    getDashboardMetrics: async () => {
        // const metrics = await AdminService.getDashboardMetrics();
        // return AdminDTO.toDashboard(metrics);
    },

    getPlayers: async (query) => {
        // const result = await AdminService.getPlayers(query);
        // return AdminDTO.toPlayerList(result.items, result.pagination);
    },

    getPlayerDetail: async (userId) => {
        // const result = await AdminService.getPlayerDetail(userId);
        // if (!result) return null;

        // return AdminDTO.toPlayerDetail(result.user, result.extra);
    },

    deactivatePlayer: async (userId, adminUserId) => {
        // const user = await AdminService.deactivatePlayer(userId, adminUserId);
        // if (!user) return null;

        // return AdminDTO.toPlayerDetail(user);
    },

    reactivatePlayer: async (userId, adminUserId) => {
        // const user = await AdminService.reactivatePlayer(userId, adminUserId);
        // if (!user) return null;

        // return AdminDTO.toPlayerDetail(user);
    },

    getRooms: async (query) => {
        // const result = await AdminService.getRooms(query);
        // return AdminDTO.toRoomList(result.items, result.pagination);
    },

    getRoomDetail: async (roomId) => {
        // const room = await AdminService.getRoomDetail(roomId);
        // if (!room) return null;

        // return AdminDTO.toRoomDetail(room);
    },

    forceCloseRoom: async (roomId, adminUserId) => {
        // const room = await AdminService.forceCloseRoom(roomId, adminUserId);
        // if (!room) return null;

        // return AdminDTO.toRoomDetail(room);
    }
};