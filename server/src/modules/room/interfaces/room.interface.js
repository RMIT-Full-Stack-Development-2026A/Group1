import { GameRoom } from "../models/gameRoom.model";

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

        return {
            id: room._id,
            roomNumber: room.roomNumber,
            boardSize: room.boardSize,
            status: room.status,
            participants: room.participants,
            moveCount: room.moveCount || 0,
            startedAt: room.startedAt || null,
            endedAt: room.endedAt || null,
            lastMove: room.lastMove || null
        };
    }
};