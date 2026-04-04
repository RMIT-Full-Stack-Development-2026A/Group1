import mongoose from "mongoose";

export const roomParticipantSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId, // Actual user currently in the live room
    ref: 'User', // Links to User model
    required: true // Every room participant must be a real signed-in user
  },
  usernameSnapshot: {
    type: String, // Username copied at the moment they joined the room
    required: true // Useful for stable room display even if user changes username later
  },
  mark: {
    type: String, // X or O assigned to the player in this room
    enum: ['X', 'O'], // Only two marks allowed
    default: null // Null while waiting for mark selection/resolution
  },
  joinedAt: {
    type: Date, // When the player entered the room
    default: Date.now // Auto-fill join time
  }
}, { _id: false });