import mongoose from "mongoose";

export const sessionParticipantSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, // Reference to real user account
        ref: 'User', 
        default: null // Null is allowed for AI opponent
    },
    usernameSnapshot: {
        type: String, // Username stored at the time the match was played
        required: true, 
        trim: true 
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
    role: {
        type: String, // Distinguishes human player from AI bot
        enum: ['HUMAN', 'AI'], 
        required: true 
    },
    mark: {
        type: String, // The mark this participant used on the board
        enum: ['X', 'O'], 
        required: true 
    },
    aiDifficulty: {
        type: String, // Difficulty of AI opponent if this participant is an AI
        enum: ['EASY', 'MEDIUM', 'HARD'], 
        default: null // Null for human players
    }
}, { _id: false });