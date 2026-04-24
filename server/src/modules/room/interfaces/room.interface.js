import { RoomService } from "../services/room.service.js";

// Minimal interface exposing room snapshot/admin operations to other modules
export const RoomInterface = {
    // Used by auth check-auth to restore unfinished room context.
    getActiveRoomSummaryByUserId: async (userId) => RoomService.getActiveRoomSummaryByUserId(userId),

    // For Admin module to render active rooms on the dashboard
    getActiveRoomsCount: async () => RoomService.getActiveRoomsCount(),

    // For Admin: Fetch paginated rooms
    getPaginatedRooms: async (filter, sort, skip, limit) => RoomService.getPaginatedRooms(filter, sort, skip, limit),

    // For Admin: Get full room details
    getRoomDetail: async (roomId, requestingUser) => RoomService.getRoomDetail(roomId, requestingUser),
};