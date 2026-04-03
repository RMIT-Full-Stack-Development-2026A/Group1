import { GameRoom } from "../models/gameRoom.model.js";
import { RoomDTO } from "../dtos/room.dto.js";

// Minimal room interface used by auth check-auth bootstrap to restore unfinished room context.
export const RoomInterface = {
    getActiveRoomSummaryByUserId: async (userId) => {
        const room = await GameRoom.findOne({
            "participants.userId": userId,
            status: { $in: ["WAITING", "READY", "PLAYING"] }
        }).lean();

        if (!room) {
            return null;
        }

        return RoomDTO.toActiveRoomSummary(room);
    }
};