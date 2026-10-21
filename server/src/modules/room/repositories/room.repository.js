import { ACTIVE_ROOM_STATUSES, ROOM_STATUS } from '../constants/room.constants.js';
import mongoose from 'mongoose';
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

        /** Fetches paginated rooms and the total number of matching rooms. */
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
    /**
     * Applies a move in ONE database operation. The filter only matches when the room is playing, it is `userId`'s
     * turn, the cell is free and the cell is on the board; the update pipeline then appends the move, advances the
     * move count and flips the turn, all computed from the stored values. Returns the updated room, or null when the
     * move was not allowed (the caller then reads the room to explain why).
     */
    applyMove: async (roomId, userId, { row, col, coordinate }) => {
        const playerId = new mongoose.Types.ObjectId(String(userId));
        return await GameRoom.findOneAndUpdate(
            {
                _id: roomId,
                status: ROOM_STATUS.PLAYING,
                boardSize: { $gt: Math.max(row, col) },
                moves: { $not: { $elemMatch: { row, col } } },
                // the participant whose turn it is must be this user
                $expr: { $eq: [{ $arrayElemAt: ['$participants.userId', '$currentTurnParticipantIndex'] }, playerId] },
            },
            [{
                $set: {
                    moves: {
                        $concatArrays: [
                            { $ifNull: ['$moves', []] },
                            [{
                                moveNumber: { $add: ['$moveCount', 1] },
                                byParticipantIndex: '$currentTurnParticipantIndex',
                                row,
                                col,
                                coordinate,
                                placedAt: '$$NOW',
                            }],
                        ],
                    },
                    moveCount: { $add: ['$moveCount', 1] },
                    lastMove: { row, col, coordinate },
                    currentTurnParticipantIndex: { $subtract: [1, '$currentTurnParticipantIndex'] },
                },
            }],
            { returnDocument: 'after', updatePipeline: true }
        ).lean();
    },

    markParticipantReady: (roomId, userId) => GameRoom.findOneAndUpdate(
        { _id: roomId, status: ROOM_STATUS.READY, 'participants.userId': userId },
        { $set: { 'participants.$.isReady': true } },
        { returnDocument: 'after' }
    ).lean(),

    // Only while the room is still waiting to start: once startIfReady has made it PLAYING this matches nothing.
    markParticipantUnready: (roomId, userId) => GameRoom.findOneAndUpdate(
        { _id: roomId, status: ROOM_STATUS.READY, 'participants.userId': userId },
        { $set: { 'participants.$.isReady': false } },
        { returnDocument: 'after' }
    ).lean(),

    startIfReady: (roomId) => GameRoom.findOneAndUpdate(
        { _id: roomId, status: ROOM_STATUS.READY, participants: { $size: 2 },
            'participants.0.isReady': true, 'participants.1.isReady': true },
        [{ $set: { status: ROOM_STATUS.PLAYING, startedAt: '$$NOW',
            currentTurnParticipantIndex: '$firstTurnParticipantIndex' } }],
        { returnDocument: 'after', updatePipeline: true }
    ).lean(),

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
