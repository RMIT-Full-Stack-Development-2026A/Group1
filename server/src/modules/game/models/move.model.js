import mongoose from "mongoose";

export const moveSchema = new mongoose.Schema({
  moveNumber: {
    type: Number, // Move order in the match: 1, 2, 3...
    required: true // Required to replay match in correct sequence
  },
  byParticipantIndex: {
    type: Number, // Which participant made the move: 0 or 1
    enum: [0, 1], // Only two participants in TicTacToe match
    required: true // Needed to know whose move it was
  },
  row: {
    type: Number, // Board row index of the move
    required: true, // Needed to reconstruct board state
    min: 0 // Row cannot be negative
  },
  col: {
    type: Number, // Board column index of the move
    required: true, // Needed to reconstruct board state
    min: 0 // Column cannot be negative
  },
  coordinate: {
    type: String, // Human-friendly algebraic notation
    required: true, // Useful for replay UI and readable records
    match: /^[A-O](?:[1-9]|1[0-5])$/
  },
  placedAt: {
    type: Date, // When this move was made
    default: Date.now // Auto-fill move timestamp
  }
}, { _id: false });