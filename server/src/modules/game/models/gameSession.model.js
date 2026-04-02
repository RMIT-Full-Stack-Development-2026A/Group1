import mongoose from 'mongoose';

const moveSchema = new mongoose.Schema({
    playerName: {type: String, required: true},
    coordinate: {type: String, required: true}, // Algebraic notation
    timestamp: {type: Date, default: Date.now}
}, {_id: false});

const gameSessionSchema = new mongoose.Schema({
    sessionNumber: {
        type: String,
        required: true,
        unique: true // Used for searching sessions
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
        userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
        name: {type: String, required: true},
        mark: {type: String, required: true} // e.g., 'X' or 'O'
    },
    player2: {
        userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null}, // Null for AI
        name: {type: String, required: true},
        mark: {type: String, required: true}
    },
    startTime: {type: Date, required: true},
    endTime: {type: Date},
    result: {
        type: String,
        enum: ['PLAYER1_WIN', 'PLAYER2_WIN', 'DRAW', 'ABORTED'],
        required: true
    },
    moves: [moveSchema] // Array of moves to reconstruct the game
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