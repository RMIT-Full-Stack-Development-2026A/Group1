import { RoomService } from "../services/room.service.js";


export const RoomInterface = {
    // Used by auth check-auth to restore unfinished room context.
    getActiveRoomSummaryByUserId: async (userId) => RoomService.getActiveRoomSummaryByUserId(userId),

    // For Admin module to retrieve active rooms count
    getActiveRoomsCount: async () => RoomService.getActiveRoomsCount(),

    // For Admin: Fetch paginated rooms
    getPaginatedRooms: async (filter, sort, skip, limit) => RoomService.getPaginatedRooms(filter, sort, skip, limit),

    // For Admin: Get full room details
    getRoomDetail: async (roomId, requestingUser) => RoomService.getRoomDetail(roomId, requestingUser),

    // For Admin: Force close room and signal Game module
    forceCloseRoomByAdmin: async (roomId) => RoomService.forceCloseRoomByAdmin(roomId)
};