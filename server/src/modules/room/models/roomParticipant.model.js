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
    // Avatar URL snapshot 
    avatarSnapshot: { 
        type: String, 
        default: null 
    },
    // Premium status snapshot 
    isPremiumSnapshot: {
        type: Boolean,
        default: false
    },
    mark: {
        type: String, // X or O assigned to the player in this room
        enum: ['X', 'O'], 
        default: null 
    },
    markerStyle: {
        type: String,
        enum: ['CLASSIC', 'GLOW', 'SKETCH', 'STONE', 'PIXEL', 'MINIMAL'],
        default: 'CLASSIC'
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