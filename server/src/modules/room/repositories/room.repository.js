import { ACTIVE_ROOM_STATUSES } from '../constants/room.constants.js';
import { GameRoom } from '../models/gameRoom.model.js';

export const RoomRepository = {
    findPaginated: async (filter, sort, skip, limit) => {
         const [rooms, total] = await Promise.all([
            GameRoom.find(filter)
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
    }
};