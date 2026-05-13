import mongoose from "mongoose";

export const roomParticipantSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, // Actual user currently in the live room
        ref: 'User', 
        required: true 
    },
    usernameSnapshot: {
        type: String, // Username copied at the moment they joined the room
        required: true 
    },
    mark: {
        type: String, // X or O assigned to the player in this room
        enum: ['X', 'O'], 
        default: null 
    },
    joinedAt: {
        type: Date, // When the player entered the room
        default: Date.now
    },
    isHost: {
        type: Boolean, 
        default: false
    },
    isReady: {
        type: Boolean, 
        default: false
    }
}, { _id: false });