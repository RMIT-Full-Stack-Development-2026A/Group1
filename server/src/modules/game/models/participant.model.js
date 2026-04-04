import mongoose from "mongoose";

export const participantSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId, // Reference to real user account if this side is a human user
    ref: 'User', // Links to User model
    default: null // Null is allowed for AI opponent
  },
  usernameSnapshot: {
    type: String, // Username stored at the time the match was played
    required: true, // Needed so old history remains readable even if username changes later
    trim: true // Clean formatting
  },
  role: {
    type: String, // Distinguishes human player from AI bot
    enum: ['HUMAN', 'AI'], // Only two roles allowed inside a match record
    required: true // Every participant must be clearly defined
  },
  mark: {
    type: String, // The mark this participant used on the board
    enum: ['X', 'O'], // Only X or O
    required: true // Required for replay and result reconstruction
  },
  aiDifficulty: {
    type: String, // Difficulty of AI opponent if this participant is an AI
    enum: ['EASY', 'MEDIUM', 'HARD'], // Supported bot levels
    default: null // Null for human players
  }
}, { _id: false });