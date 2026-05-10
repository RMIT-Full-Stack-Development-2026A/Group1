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
    
    createRoom: async (roomData) => {
        const room = new GameRoom(roomData);
        return room.save();
    },
    addParticipant: async (roomId, participant, newStatus) => {
        return GameRoom.findOneAndUpdate(
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

    addParticipantAndStart: async (roomId, participant, newStatus) => {
        return GameRoom.findByIdAndUpdate(
            roomId,
            { 
                $push: { participants: participant },
                $set: { 
                    status: newStatus,
                    startedAt: new Date(),
                    currentTurnParticipantIndex: 0 // Player 1 always starts first per typical rules
                }
            },
            { new: true }
        ).lean();
    },

    pushMove: async (roomId, move, nextTurnIndex) => {
        return GameRoom.findByIdAndUpdate(
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
        return GameRoom.findByIdAndUpdate(
            roomId, 
            { $set: updateFields }, 
            { returnDocument: 'after' }
        ).lean();
    },

    deleteRoom: async (roomId) => {
        return GameRoom.findByIdAndDelete(roomId);
    }
};