import { ACTIVE_ROOM_STATUSES, ROOM_STATUS } from '../constants/room.constants.js';
import { GameRoom } from '../models/gameRoom.model.js';

export const RoomRepository = {
    /** Retrieves paginated rooms. */
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

        /** Finds room by ID. */
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

    /** Finds room by ID. */
    findById: async (id) => {
        return await GameRoom.findById(id).lean();
    },

    /** Finds active room by user ID. */
    findActiveRoomByUserId: async (userId) => {
        return await GameRoom.findOne({
            "participants.userId": userId,
            status: { $in: ACTIVE_ROOM_STATUSES }
        }).lean();
    },

    /** Counts active rooms. */
    countActiveRooms: async () => {
        return await GameRoom.countDocuments({
            status: { $in: ACTIVE_ROOM_STATUSES }
        });
    },
    
    /** Creates a room. */
    createRoom: async (roomData) => {
        const room = new GameRoom(roomData);
        return await room.save();
    },

    /** Adds participant to room. */
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

    /** Pushes move to room. */
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

    /** Updates room status. */
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