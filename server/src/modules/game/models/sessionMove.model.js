import mongoose from "mongoose";

export const sessionMoveSchema = new mongoose.Schema({
    moveNumber: {
        type: Number, // Move order in the match
        required: true 
    },
    byParticipantIndex: {
        type: Number, // Which participant made the move: 0 or 1
        enum: [0, 1], 
        required: true 
    },
    row: {
        type: Number, // Board row index of the move
        required: true, 
        min: 0 
    },
    col: {
        type: Number, // Board column index of the move
        required: true, 
        min: 0
    },
    coordinate: {
        type: String, // Algebraic notation
        required: true, // For replay UI and readable records
        match: /^[A-O](?:[1-9]|1[0-5])$/
    },
    placedAt: {
        type: Date, // When this move was made
        default: Date.now 
    }
}, { _id: false });