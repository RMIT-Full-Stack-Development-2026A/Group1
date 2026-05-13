import { ACTIVE_ROOM_STATUSES, ROOM_STATUS } from '../constants/room.constants.js';
import { GameRoom } from '../models/gameRoom.model.js';

export const RoomRepository = {
    findPaginated: async (filter, sort, skip, limit) => {
        const summaryProjection = {
            roomNumber: 1,
            boardSize: 1,
            boardStyle: 1,
            markerStyle: 1,
            status: 1,
            participants: 1,
            moveCount: 1,
            startedAt: 1,
            endedAt: 1,
            lastMove: 1,
            createdAt: 1
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
        return await GameRoom.findById(id).lean();
    },

    // Interface lookup for Auth module
    findActiveRoomByUserId: async (userId) => {
        return await GameRoom.findOne({
            "participants.userId": userId,
            status: { $in: ACTIVE_ROOM_STATUSES }
        }).lean();
    },

    // Interface lookup for Admin dashboard
    countActiveRooms: async () => {
        return await GameRoom.countDocuments({
            status: { $in: ACTIVE_ROOM_STATUSES }
        });
    },
    
    createRoom: async (roomData) => {
        const room = new GameRoom(roomData);
        return await room.save();
    },
    addParticipant: async (roomId, participant, newStatus) => {
        return await GameRoom.findOneAndUpdate(
            { 
                _id: roomId, 
                status: ROOM_STATUS.WAITING, 
                'participants.1': { $exists: false } 
            },
            { 
                $push: { participants: participant },
                $set: { status: newStatus } 
            },
            { returnDocument: 'after' } 
        ).lean();
    },

    pushMove: async (roomId, move, nextTurnIndex) => {
        return await GameRoom.findByIdAndUpdate(
            roomId,
            {
                $push: { moves: move },
                $inc: { moveCount: 1 },
                $set: { 
                    currentTurnParticipantIndex: nextTurnIndex,
                    lastMove: { row: move.row, col: move.col, coordinate: move.coordinate }
                }
            },
            { returnDocument: 'after' }
        ).lean();
    },

    updateRoomStatus: async (roomId, updateFields) => {
        return await GameRoom.findByIdAndUpdate(
            roomId, 
            { $set: updateFields }, 
            { returnDocument: 'after' }
        ).lean();
    },

    deleteRoom: async (roomId) => {
        return await GameRoom.findByIdAndDelete(roomId);
    }
};