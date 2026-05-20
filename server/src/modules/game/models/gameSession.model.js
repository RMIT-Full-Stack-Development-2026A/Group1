import mongoose from "mongoose";
import { ulid } from "ulid";
import { baseSchemaOptions } from "../../../utils/baseSchemaOptions.js";
import { sessionParticipantSchema } from "./sessionParticipant.model.js";
import { sessionMoveSchema } from "./sessionMove.model.js";

const gameSessionSchema = new mongoose.Schema({
    sessionNumber: {
        type: String, // Human-readable unique match code/number
        required: true,
        unique: true, 
        index: true, 
        default: () => `GS-${ulid()}` // ULID prevents B-Tree index fragmentation
    },

    sourceRoomId: {
        type: mongoose.Schema.Types.ObjectId, // Original live room id 
        ref: 'GameRoom', 
        default: null // Null for local or AI matches
    },

    gameType: {
        type: String, // High-level type of match
        enum: ['SINGLE_PLAYER', 'TWO_PLAYERS', 'ONLINE_MATCH'], 
        required: true, 
        index: true 
    },

    boardSize: {
        type: Number, // Board size selected for the match
        enum: [10, 15], 
        required: true, 
        index: true 
    },

    boardStyle: {
        type: String, // Visual board theme used when the match was played
        enum: ['JUNGLE', 'DARK', 'LAVA'], 
        default: 'JUNGLE'
    },

    participants: {
        type: [sessionParticipantSchema], // Stores exactly two participants of the match
        validate: {
        validator: (arr) => Array.isArray(arr) && arr.length === 2,
        message: 'A game session must have exactly 2 participants.'
        }
    },

    firstTurnParticipantIndex: {
        type: Number, // Participant moved first: 0 or 1
        enum: [0, 1], 
        required: true 
    },

    winnerParticipantIndex: {
        type: Number, // Which participant won the game
        enum: [0, 1], 
        default: null // Null for draw or aborted game
    },

    status: {
        type: String, // Final high-level outcome state of the match
        enum: ['FINISHED', 'DRAW', 'ABORTED'], 
        required: true, 
        index: true 
    },

    endedReason: {
        type: String, //  Detailed reason why the match ended
        enum: ['WIN', 'DRAW', 'ABORT', 'ADMIN_FORCE_CLOSE'],
        required: true 
    },

    abortedByUserId: {
        type: mongoose.Schema.Types.ObjectId, // Which user aborted the game
        ref: 'User',
        default: null 
    },

    winningLine: {
        type: [{ row: Number, col: Number, coordinate: String }], // Coordinates of the winning 5-cell line
        default: [] // Empty for draw or aborted game
    },

    moves: {
        type: [sessionMoveSchema], // Full move history for replay
        default: [] 
    },

    totalMoves: {
        type: Number, // Cached number of moves for quick display/filtering
        default: 0 
    },

    startedAt: {
        type: Date,
        required: true, 
        default: Date.now 
    },

    endedAt: {
        type: Date, 
        default: null, 
        index: true 
    },

    durationMs: {
        type: Number, // Total match duration in milliseconds
        default: 0 
    }
}, baseSchemaOptions);

gameSessionSchema.index({ createdAt: -1 }); // For latest history queries
gameSessionSchema.index({ endedAt: -1 }); // For sorting by end time
gameSessionSchema.index({ gameType: 1, endedAt: -1 }); // For filtered history pages
gameSessionSchema.index({ 'participants.userId': 1, endedAt: -1 }, { sparse: true}); // Fast lookup of a user's matches
gameSessionSchema.index({ 'participants.usernameSnapshot': 'text', sessionNumber: 'text' }); // Search by opponent name or session number

export const GameSession = mongoose.model('GameSession', gameSessionSchema);