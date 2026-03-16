import mongoose from 'mongoose';

const gameRoomSchema = new mongoose.Schema({
    roomNumber: {
        type: String,
        required: true,
        unique: true
    },
    player1: {
        userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
        name: {type: String, required: true}
    },
    player2: {
        userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null},
        name: {type: String, default: null} // Populated when second player joins
    },
    startTime: {type: Date, default: Date.now},
    status: {
        type: String,
        enum: ['WAITING', 'PLAYING', 'CLOSED'],
        default: 'WAITING'
    }
}, {timestamps: true});

export const GameRoom = mongoose.model('GameRoom', gameRoomSchema);