import { RoomService } from "../services/room.service.js";

// Minimal interface exposing room snapshot/admin operations to other modules
export const RoomInterface = {
    // Used by auth check-auth to restore unfinished room context.
    getActiveRoomSummaryByUserId: async (userId) => RoomService.getActiveRoomSummaryByUserId(userId),

    // Used by Admin module to render active rooms on the dashboard
    getActiveRoomsCount: async () => RoomService.getActiveRoomsCount()
};