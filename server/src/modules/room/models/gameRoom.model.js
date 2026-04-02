import mongoose from 'mongoose';
import { RoomMove } from './roomMove.model';
import { RoomParticipant } from './roomParticipant.model';
import { baseSchemaOptions } from '../../../utils/baseSchemaOptions';

const gameRoomSchema = new mongoose.Schema({
    roomNumber: {
        type: String, // Human-readable unique room code/number
        required: true, // Every room needs a unique identifier
        unique: true, // Prevent duplicate room numbers
        index: true // Speeds up room lookup
    },

    boardSize: {
        type: Number, // Board size selected for this online room
        enum: [10, 15], // Only supported sizes
        required: true, // Needed before game starts
        index: true // Helps filter room listings by board size
    },

    status: {
        type: String, // Current lifecycle state of the room
        enum: ['WAITING', 'READY', 'PLAYING', 'ABORTED', 'CLOSED'], // Supported live room states
        default: 'WAITING', // New room starts as waiting for another player
        index: true // Useful for arena filtering
    },

    participants: {
        type: [RoomParticipant], // Current players inside the room
        default: [] // Starts empty until creator joins / room is created
    },

    currentTurnParticipantIndex: {
        type: Number, // Which participant is allowed to move now
        enum: [0, 1], // Only two sides exist
        default: null // Null before game starts or after it ends
    },

    moves: {
        type: [RoomMove], // Live move list used for socket sync and reconnect
        default: [] // No moves at room creation
    },

    moveCount: {
        type: Number, // Cached live move count for quick access
        default: 0 // Starts at zero
    },

    winningLine: {
        type: [{ row: Number, col: Number, coordinate: String }], // Live winning line when the game ends
        default: [] // Empty unless someone wins
    },

    lastMove: {
        row: { type: Number, default: null }, // Row of the most recent move
        col: { type: Number, default: null }, // Column of the most recent move
        coordinate: { type: String, default: null } // Human-readable coordinate of the most recent move
    },

    startedAt: {
        type: Date, // Time when actual gameplay started
        default: null // Null while room is only waiting/ready
    },

    endedAt: {
        type: Date, // Time when room ended or was closed
        default: null // Null while room is still active
    },

    closedBy: {
        type: String, // Who closed the room
        enum: ['PLAYER', 'ADMIN', 'SYSTEM'], // Useful for auditing why room disappeared
        default: null // Null until room is closed
    }
}, baseSchemaOptions);

gameRoomSchema.index({ status: 1, createdAt: -1 }); // Fast arena queries by room status
gameRoomSchema.index({ 'participants.userId': 1, status: 1 }); // Fast reconnect lookup for a user's active room

export const GameRoom = mongoose.model('GameRoom', gameRoomSchema);