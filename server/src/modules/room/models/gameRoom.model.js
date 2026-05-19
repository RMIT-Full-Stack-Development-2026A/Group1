import mongoose from 'mongoose';
import { ulid } from 'ulid';
import { roomMoveSchema } from './roomMove.model.js';
import { roomParticipantSchema } from './roomParticipant.model.js';
import { baseSchemaOptions } from '../../../utils/baseSchemaOptions.js';
import { ALL_ROOM_STATUSES, ROOM_STATUS } from '../constants/room.constants.js';

const gameRoomSchema = new mongoose.Schema({
    roomNumber: {
        type: String, // Human-readable unique room code/number
        required: true, 
        unique: true, 
        index: true,
        default: () => `RM-${ulid()}` // ULID prevents B-Tree index fragmentation
    },

    boardSize: {
        type: Number, 
        enum: [10, 15],
        required: true,
        index: true 
    },

    boardStyle: {
        type: String, 
        enum: ['CLASSIC', 'DARK', 'NEON'], 
        default: 'CLASSIC'
    },

    firstTurnParticipantIndex: {
        type: Number, 
        enum: [0, 1],
        default: 0 
    },

    status: {
        type: String, 
        enum: ALL_ROOM_STATUSES,
        default: ROOM_STATUS.WAITING, 
        index: true 
    },

    participants: {
        type: [roomParticipantSchema], // Current players inside the room
        default: [] 
    },

    currentTurnParticipantIndex: {
        type: Number, // Which participant is allowed to move now
        enum: [0, 1], 
        default: null 
    },

    moves: {
        type: [roomMoveSchema], // Live move list used for socket sync and reconnect
        default: [] 
    },

    moveCount: {
        type: Number, 
        default: 0 
    },

    winningLine: {
        type: [{ row: Number, col: Number, coordinate: String }], // Live winning line when the game ends
        default: [] 
    },

    lastMove: {
        row: { type: Number, default: null }, // Row of the most recent move
        col: { type: Number, default: null }, // Column of the most recent move
        coordinate: { type: String, default: null } // Human-readable coordinate of the most recent move
    },

    startedAt: {
        type: Date, 
        default: null // Null while room is only waiting/ready
    },

    endedAt: {
        type: Date, 
        default: null 
    },

    closedBy: {
        type: String, // Who closed the room
        enum: ['PLAYER', 'ADMIN', 'SYSTEM'], 
        default: null // Null until room is closed
    }
}, baseSchemaOptions);

gameRoomSchema.index({ status: 1, createdAt: -1 }); // Fast arena queries by room status
gameRoomSchema.index({ 'participants.userId': 1, status: 1 }); // Fast reconnect lookup for a user's active room
gameRoomSchema.index({ endedAt: 1 }, { expireAfterSeconds: 60*10 }) // TTL: Engine auto-deletes document 10 minutes after closure
//auto remove the Room with status WATING for 30mins
gameRoomSchema.index(
    { createdAt: 1 }, 
    { expireAfterSeconds: 1800, partialFilterExpression: { status: ROOM_STATUS.WAITING } }
);

export const GameRoom = mongoose.model('GameRoom', gameRoomSchema);