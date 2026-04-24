import { ACTIVE_ROOM_STATUSES } from '../constants/room.constants.js';
import { GameRoom } from '../models/gameRoom.model.js';

export const RoomRepository = {
    findPaginated: async (filter, sort, skip, limit) => {
        const summaryProjection = {
            roomNumber: 1,
            boardSize: 1,
            status: 1,
            participants: 1,
            moveCount: 1,
            startedAt: 1,
            endedAt: 1,
            lastMove: 1
        };

        const [rooms, total] = await Promise.all([
            GameRoom.find(filter)
                .select(summaryProjection)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .lean(),
            GameRoom.countDocuments(filter)
        ]);
        return { rooms, total };
    },

    findById: async (id) => {
        return GameRoom.findById(id).lean();
    },

    // Interface lookup for Auth module
    findActiveRoomByUserId: async (userId) => {
        return GameRoom.findOne({
            "participants.userId": userId,
            status: { $in: ACTIVE_ROOM_STATUSES }
        }).lean();
    },

    // Interface lookup for Admin dashboard
    countActiveRooms: async () => {
        return GameRoom.countDocuments({
            status: { $in: ACTIVE_ROOM_STATUSES }
        });
    },
    updateRoomStatus: async (roomId, updateFields) => {
        return GameRoom.findByIdAndUpdate(
            roomId, 
            { $set: updateFields }, 
            { new: true }
        );
    }
};