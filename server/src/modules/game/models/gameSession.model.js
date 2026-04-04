import mongoose from "mongoose";
import { moveSchema } from "./move.model.js";
import { participantSchema } from "./participant.model.js";
import { baseSchemaOptions } from "../../../utils/baseSchemaOptions.js";

const gameSessionSchema = new mongoose.Schema({
  sessionNumber: {
    type: String, // Human-readable unique match code/number
    required: true, // Every match must have a unique reference
    unique: true, // Prevent duplicate session numbers
    index: true // Speeds up search by session number
  },

  sourceRoomId: {
    type: mongoose.Schema.Types.ObjectId, // Original live room id if this came from online multiplayer
    ref: 'GameRoom', // Links archived match back to its room origin
    default: null // Null for local or AI matches
  },

  gameType: {
    type: String, // High-level type of match
    enum: ['SINGLE_PLAYER', 'TWO_PLAYERS', 'ONLINE_MATCH'], // Supported match categories
    required: true, // Required for filtering/history display
    index: true // Speeds up filter by game type
  },

  boardSize: {
    type: Number, // Board size selected for the match
    enum: [10, 15], // Only supported board sizes
    required: true, // Required for replay and board rendering
    index: true // Helps filter by board size if needed
  },

  boardStyle: {
    type: String, // Visual board theme used when the match was played
    enum: ['CLASSIC', 'DARK', 'NEON'], // Supported board themes
    default: 'CLASSIC' // Fallback style
  },

  markerStyle: {
    type: String, // Visual marker theme used in the match
    enum: ['CLASSIC', 'GLOW', 'SKETCH', 'STONE', 'PIXEL', 'MINIMAL'], // Supported marker sets
    default: 'CLASSIC' // Fallback marker style
  },

  participants: {
    type: [participantSchema], // Stores exactly two participants of the match
    validate: {
      validator: (arr) => Array.isArray(arr) && arr.length === 2, // Enforce exactly 2 sides
      message: 'A game session must have exactly 2 participants.'
    }
  },

  firstTurnParticipantIndex: {
    type: Number, // Which participant moved first: 0 or 1
    enum: [0, 1], // Only valid participant positions
    required: true // Needed to reconstruct game flow accurately
  },

  winnerParticipantIndex: {
    type: Number, // Which participant won the game
    enum: [0, 1], // Only participant 0 or 1 can win
    default: null // Null for draw or aborted game
  },

  status: {
    type: String, // Final high-level outcome state of the match
    enum: ['FINISHED', 'DRAW', 'ABORTED'], // Supported end states
    required: true, // Every saved session must have a final status
    index: true // Speeds up filtering by result status
  },

  endedReason: {
    type: String, // More detailed reason why the match ended
    enum: ['WIN', 'DRAW', 'ABORT', 'ADMIN_FORCE_CLOSE'], // Useful for audit and admin cases
    required: true // Required so end state is explicit
  },

  abortedByUserId: {
    type: mongoose.Schema.Types.ObjectId, // Which user aborted the game
    ref: 'User', // Links to actual user if needed for audit
    default: null // Null unless the game was aborted by a player
  },

  winningLine: {
    type: [{ row: Number, col: Number, coordinate: String }], // Coordinates of the winning 5-cell line
    default: [] // Empty for draw or aborted game
  },

  moves: {
    type: [moveSchema], // Full move history for replay
    default: [] // Starts empty until moves are added
  },

  totalMoves: {
    type: Number, // Cached number of moves for quick display/filtering
    default: 0 // Starts at zero
  },

  startedAt: {
    type: Date, // Actual time when match began
    required: true, // Every session needs a start time
    default: Date.now // Auto-fill if not manually provided
  },

  endedAt: {
    type: Date, // Actual time when match ended
    default: null, // Null until the game finishes
    index: true // Helps sort/filter history by ending time
  },

  durationMs: {
    type: Number, // Total match duration in milliseconds
    default: 0 // Zero until calculated or set
  }
}, baseSchemaOptions);

gameSessionSchema.index({ createdAt: -1 }); // Useful for latest history queries
gameSessionSchema.index({ endedAt: -1 }); // Useful for sorting by end time
gameSessionSchema.index({ gameType: 1, endedAt: -1 }); // Useful for filtered history pages
gameSessionSchema.index({ 'participants.userId': 1, endedAt: -1 }); // Fast lookup of a user's matches
gameSessionSchema.index({ 'participants.usernameSnapshot': 'text', sessionNumber: 'text' }); // Search by opponent name or session number

export const GameSession = mongoose.model('GameSession', gameSessionSchema);