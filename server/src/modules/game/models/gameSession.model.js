import mongoose from 'mongoose';

// Move Schema 
const moveSchema = new mongoose.Schema({
    playerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null // null for AI moves
    },
    playerType: {
        type: String,
        enum: ['HUMAN', 'AI'],
        required: true
    },
    coordinate: {
        type: String,
        required: true,
        match: /^[A-O][1-9]$|^[A-O]1[0-5]$/ 
    },
    moveNumber: {
        type: Number,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {_id: false});

// Game Session Schema 
const gameSessionSchema = new mongoose.Schema({
    sessionNumber: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    gameType: {
        type: String,
        enum: ['SINGLE_PLAYER', 'TWO_PLAYERS', 'ONLINE_MATCH'],
        required: true
    },
    boardSize: {
        type: Number,
        enum: [10, 15],
        default: 10 // 10x10 or 15x15 board sizes
    },
    player1: {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        name: { type: String, required: true },
        mark: { type: String, enum: ['X', 'O'], required: true },
    },
    player2: {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null // null for AI opponent
        },
        name: { type: String, required: true },
        mark: { type: String, enum: ['X', 'O'], required: true },
        isAI: {
            type: Boolean,
            required: true // Must be true if userId is null
        },
        aiDifficulty: {
            type: String,
            enum: ['EASY', 'MEDIUM', 'HARD'],
            default: null // null if human player
        }
    },
    startTime: {
        type: Date,
        required: true,
        default: Date.now
    },
    endTime: {
        type: Date,
        default: null
    },
    duration: {
        type: Number,
        default: null
    },
    result: {
        type: String,
        enum: ['PLAYER1_WIN', 'PLAYER2_WIN', 'DRAW', 'ABORTED', 'ONGOING'],
        required: true,
        default: 'ONGOING'
    },
    winningLine: {
        type: [String], // Array of coordinate for winning line
        default: null
    },
    moves: [moveSchema], // Array of moves to reconstruct the game
    totalMoves: {
        type: Number,
        default: 0
    },
}, {timestamps: true});

// change _id to id 
gameSessionSchema.set('toJSON', {
    virtuals: true, // include virtuals
    versionKey: false, // remove __v
    transform: function (doc, ret) {
        ret.id = ret._id; // copy _id to id 
        delete ret._id; // remove _id
    }
});

export const GameSession = mongoose.model('GameSession', gameSessionSchema);