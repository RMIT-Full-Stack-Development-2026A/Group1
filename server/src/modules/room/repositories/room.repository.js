import { GameRoom } from '../models/gameRoom.model.js';

export const RoomRepository = {
    findPaginated: async (filter, sort, skip, limit) => {
        const rooms = await GameRoom.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean();
        
        const total = await GameRoom.countDocuments(filter);
        return { rooms, total };
    },

    findById: async (id) => {
        return GameRoom.findById(id).lean();
    },

    // Interface lookup for Auth module
    findActiveRoomByUserId: async (userId) => {
        return GameRoom.findOne({
            "participants.userId": userId,
            status: { $in: ["WAITING", "READY", "PLAYING"] }
        }).lean();
    },

    // Interface lookup for Admin dashboard
    countActiveRooms: async () => {
        return GameRoom.countDocuments({
            status: { $in: ["WAITING", "READY", "PLAYING"] }
        });
    }
};